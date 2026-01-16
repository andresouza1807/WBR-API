from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "USER"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    active: Optional[bool] = None


class UserResponse(BaseModel):
    id: UUID
    company_id: UUID
    name: str
    email: str
    role: str
    active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
