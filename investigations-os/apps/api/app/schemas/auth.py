from pydantic import BaseModel, EmailStr
import uuid


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class CurrentUser(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    email: str
    display_name: str
    role: str

    model_config = {"from_attributes": True}
