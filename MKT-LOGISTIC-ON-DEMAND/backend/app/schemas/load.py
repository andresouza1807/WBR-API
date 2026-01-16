from uuid import UUID
from pydantic import BaseModel
from datetime import datetime


class LoadCreate(BaseModel):
    title: str
    description: str | None = None
    weight_kg: int
    volume_m3: float


class LoadUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    weight_kg: int | None = None
    volume_m3: float | None = None
    status: str | None = None


class LoadResponse(BaseModel):
    id: UUID
    company_id: UUID
    title: str
    description: str | None = None
    weight_kg: int
    volume_m3: float
    status: str
    assigned_transporter_id: UUID | None = None
    created_by: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
