from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog

from app.core.config import get_settings
from app.api.v1.router import api_router

settings = get_settings()
log = structlog.get_logger()


def create_app() -> FastAPI:
    app = FastAPI(
        title="CaseGraph API",
        description="Investigations OS — powered by CaseGraph v1",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.app_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    @app.get("/health")
    async def health():
        return {"status": "ok", "version": "0.1.0"}

    @app.on_event("startup")
    async def on_startup():
        log.info("CaseGraph API starting", env=settings.app_env)

    return app


app = create_app()
