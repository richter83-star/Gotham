from fastapi import APIRouter
from app.api.endpoints import cases, entities, ingestion, search, graph, approvals, events, rules, auth, ai, osint

router = APIRouter()

router.include_router(cases.router, prefix="/cases", tags=["cases"])
router.include_router(entities.router, prefix="/entities", tags=["entities"])
router.include_router(ingestion.router, prefix="/ingestion", tags=["ingestion"])
router.include_router(osint.router, prefix="/osint", tags=["osint"])
router.include_router(search.router, prefix="/search", tags=["search"])
router.include_router(graph.router, prefix="/graph", tags=["graph"])
router.include_router(approvals.router, prefix="/approvals", tags=["approvals"])
router.include_router(events.router, prefix="/events", tags=["events"])
router.include_router(rules.router, prefix="/rules", tags=["rules"])
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])
