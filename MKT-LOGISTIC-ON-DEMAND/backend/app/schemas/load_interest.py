from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class LoadInterestCreate(BaseModel):
    load_id: UUID
    proposed_price: Optional[float] = None
    message: Optional[str] = None


class LoadInterestUpdate(BaseModel):
    proposed_price: Optional[float] = None
    message: Optional[str] = None
    status: Optional[str] = None


class LoadInterestResponse(BaseModel):
    id: UUID
    load_id: UUID
    transporter_id: UUID
    company_id: UUID
    proposed_price: Optional[float] = None
    message: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
