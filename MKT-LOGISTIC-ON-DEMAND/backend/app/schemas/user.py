from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    company_id: UUID
    role: str = "USER"


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    role: str | None = None
    active: bool | None = None


class UserResponse(BaseModel):
    id: UUID
    company_id: UUID
    name: str
    email: str
    role: str
    active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
