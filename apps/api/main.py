from fastapi import FastAPI
from app.api.router import router as v1_router

app = FastAPI(
    title="CaseGraph API",
    description="Investigations OS Backend",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {"message": "Welcome to CaseGraph API"}

app.include_router(v1_router, prefix="/api/v1")
