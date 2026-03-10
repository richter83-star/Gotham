from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import uuid

from app.db.database import get_db
from app.models.case import Case, CaseNote, CaseTask, CaseEntity
from app.models.evidence import Evidence
from app.models.audit import Decision
from app.models.user import User
from app.schemas.cases import (
    CaseCreate, CaseUpdate, CaseResponse,
    NoteCreate, NoteResponse,
    TaskCreate, TaskResponse,
    EvidenceCreate, EvidenceResponse,
    DecisionCreate, DecisionResponse,
)
from app.schemas.common import PaginatedResponse
from app.api.v1.deps import get_current_user, require_roles
from app.services.audit.logger import audit_log
from app.services.cases.numbering import generate_case_number

router = APIRouter(prefix="/cases", tags=["cases"])


@router.get("", response_model=PaginatedResponse[CaseResponse])
async def list_cases(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    status: str | None = None,
    priority: str | None = None,
    assigned_to: uuid.UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Case).where(Case.tenant_id == current_user.tenant_id)
    if status:
        q = q.where(Case.status == status)
    if priority:
        q = q.where(Case.priority == priority)
    if assigned_to:
        q = q.where(Case.assigned_to == assigned_to)

    total_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = total_result.scalar_one()

    q = q.order_by(Case.updated_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    cases = result.scalars().all()

    return PaginatedResponse(
        items=cases,
        total=total,
        page=page,
        page_size=page_size,
        pages=(total + page_size - 1) // page_size,
    )


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    payload: CaseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    case_number = await generate_case_number(db, current_user.tenant_id)
    case = Case(
        tenant_id=current_user.tenant_id,
        case_number=case_number,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        tags=payload.tags,
        assigned_to=payload.assigned_to,
        created_by=current_user.id,
    )
    db.add(case)
    await db.flush()
    await audit_log(
        db=db,
        tenant_id=current_user.tenant_id,
        actor_id=current_user.id,
        actor_email=current_user.email,
        action="case.created",
        resource_type="case",
        resource_id=case.id,
        after_state={"case_number": case_number, "title": payload.title},
    )
    return case


@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    case = await _get_case_or_404(db, case_id, current_user.tenant_id)
    await audit_log(
        db=db,
        tenant_id=current_user.tenant_id,
        actor_id=current_user.id,
        actor_email=current_user.email,
        action="case.viewed",
        resource_type="case",
        resource_id=case_id,
    )
    return case


@router.patch("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: uuid.UUID,
    payload: CaseUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    case = await _get_case_or_404(db, case_id, current_user.tenant_id)
    before = {"status": case.status, "priority": case.priority}
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(case, field, value)
    await audit_log(
        db=db,
        tenant_id=current_user.tenant_id,
        actor_id=current_user.id,
        actor_email=current_user.email,
        action="case.updated",
        resource_type="case",
        resource_id=case_id,
        before_state=before,
        after_state=payload.model_dump(exclude_unset=True),
    )
    return case


@router.post("/{case_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def add_note(
    case_id: uuid.UUID,
    payload: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_case_or_404(db, case_id, current_user.tenant_id)
    note = CaseNote(
        case_id=case_id,
        author_id=current_user.id,
        body=payload.body,
        is_pinned=payload.is_pinned,
    )
    db.add(note)
    await db.flush()
    return note


@router.post("/{case_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def add_task(
    case_id: uuid.UUID,
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_case_or_404(db, case_id, current_user.tenant_id)
    task = CaseTask(
        case_id=case_id,
        created_by=current_user.id,
        assigned_to=payload.assigned_to,
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
    )
    db.add(task)
    await db.flush()
    return task


@router.post(
    "/{case_id}/evidence", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED
)
async def add_evidence(
    case_id: uuid.UUID,
    payload: EvidenceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_case_or_404(db, case_id, current_user.tenant_id)
    evidence = Evidence(
        tenant_id=current_user.tenant_id,
        case_id=case_id,
        document_id=payload.document_id,
        title=payload.title,
        description=payload.description,
        evidence_type=payload.evidence_type,
        extracted_fields={},
        added_by=current_user.id,
    )
    db.add(evidence)
    await db.flush()
    await audit_log(
        db=db,
        tenant_id=current_user.tenant_id,
        actor_id=current_user.id,
        actor_email=current_user.email,
        action="evidence.added",
        resource_type="evidence",
        resource_id=evidence.id,
        after_state={"case_id": str(case_id), "title": payload.title},
    )
    return evidence


@router.post(
    "/{case_id}/decision", response_model=DecisionResponse, status_code=status.HTTP_201_CREATED
)
async def record_decision(
    case_id: uuid.UUID,
    payload: DecisionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Sensitive decision types require senior role
    GOVERNED_TYPES = {
        "merge_entities", "close_confirmed", "close_unsubstantiated",
        "escalate", "freeze_account", "flag_entity", "export_report",
        "send_notification", "reassign", "delete_evidence",
    }
    if payload.decision_type in GOVERNED_TYPES:
        allowed_roles = {"senior_investigator", "case_manager", "admin"}
        if current_user.role.name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This decision type requires senior_investigator or higher",
            )

    await _get_case_or_404(db, case_id, current_user.tenant_id)
    decision = Decision(
        tenant_id=current_user.tenant_id,
        case_id=case_id,
        decision_type=payload.decision_type,
        rationale=payload.rationale,
        decided_by=current_user.id,
        requires_approval=payload.requires_approval,
    )
    db.add(decision)
    await db.flush()
    await audit_log(
        db=db,
        tenant_id=current_user.tenant_id,
        actor_id=current_user.id,
        actor_email=current_user.email,
        action=f"decision.{payload.decision_type}",
        resource_type="decision",
        resource_id=decision.id,
        after_state={"case_id": str(case_id), "type": payload.decision_type},
    )
    return decision


async def _get_case_or_404(db: AsyncSession, case_id: uuid.UUID, tenant_id: uuid.UUID) -> Case:
    result = await db.execute(
        select(Case).where(Case.id == case_id, Case.tenant_id == tenant_id)
    )
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return case
