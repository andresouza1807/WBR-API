from uuid import UUID
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class LoadCreate(BaseModel):
    title: str
    description: Optional[str] = None
    weight_kg: int
    volume_m3: float


class LoadUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    weight_kg: Optional[int] = None
    volume_m3: Optional[float] = None
    status: Optional[str] = None


class LoadResponse(BaseModel):
    id: UUID
    company_id: UUID
    title: str
    description: Optional[str] = None
    weight_kg: int
    volume_m3: float
    status: str
    assigned_transporter_id: Optional[UUID] = None
    created_by: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
