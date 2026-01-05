from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime, date


class Load(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_id: UUID = Field(foreign_key="company.id")
    title: str
    description: str | None = None
    weight_kg: int
    length_cm: int
    width_cm: int
    height_cm: int
    volume_m3: float
    oring_city: str
    oring_state: str
    destination_city: str
    destination_state: str
    pickup_date: date
    delivery_deadline: date | None = None
    vehicle_type_id: UUID | None = Field(
        default=None, foreign_key="vehicle_type.id")
    status: str = "open"  # available | assigned | in_transit | delivered
    created_by: UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.now)
    # updated_at: datetime = Field(default_factory=datetime.now, nullable=False)
