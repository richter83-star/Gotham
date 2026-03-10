from fastapi import APIRouter

from app.api.v1.endpoints import auth, cases, entities, search, ingestion, alerts, audit

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(cases.router)
api_router.include_router(entities.router)
api_router.include_router(search.router)
api_router.include_router(ingestion.router)
api_router.include_router(alerts.router)
api_router.include_router(audit.router)
