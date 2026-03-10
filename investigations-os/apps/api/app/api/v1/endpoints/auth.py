from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.models.user import User, Role
from app.schemas.auth import LoginRequest, TokenResponse, CurrentUser
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.services.audit.logger import audit_log
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password or ""):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    await audit_log(
        db=db,
        tenant_id=user.tenant_id,
        actor_id=user.id,
        actor_email=user.email,
        action="auth.login",
        resource_type="user",
        resource_id=user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=CurrentUser)
async def get_me(current_user: User = Depends(get_current_user)):
    return CurrentUser(
        id=current_user.id,
        tenant_id=current_user.tenant_id,
        email=current_user.email,
        display_name=current_user.display_name,
        role=current_user.role.name if current_user.role else "unknown",
    )
