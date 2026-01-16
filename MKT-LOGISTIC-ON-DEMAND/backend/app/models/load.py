from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime, date


class Load(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_id: UUID = Field(foreign_key="company.id")

    title: str
    description: str | None = None
    weight_kg: int
    volume_m3: float

    status: str = "open"  # available | assigned | in_transit | delivered
    assigned_transporter_id: UUID | None = Field(
        foreign_key="user.id", default=None)

    created_by: UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now, sa_column_kwargs={
                                 "onupdate": datetime.now})
