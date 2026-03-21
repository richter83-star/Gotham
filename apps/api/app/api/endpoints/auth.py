from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core import security
from app.api import deps
from app.schemas.token import Token

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    db: Any = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    # Simplified login logic for skeleton
    # In reality, verify user against DB
    user = {"id": "123", "email": form_data.username}
    access_token_expires = timedelta(minutes=security.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user["id"], expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
