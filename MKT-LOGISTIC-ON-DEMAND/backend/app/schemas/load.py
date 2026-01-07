from uuid import UUID
from pydantic import BaseModel
from datetime import datetime


class LoadCreate(BaseModel):
    def __call__(self, *args, **kwds):
        return super().__call__(*args, **kwds)
    title: str
    description: str | None = None
    weight: float
    volume_m3: float


class LoadResponse(BaseModel):
    def __call__(self, *args, **kwds):
        return super().__call__(*args, **kwds)
    id: UUID
    title: str
    description: str | None = None
    weight: float
    volume_m3: float
    company_id: UUID
    created_at: datetime

    class Config:
        from_attribute = True
        # orm_mode = True
