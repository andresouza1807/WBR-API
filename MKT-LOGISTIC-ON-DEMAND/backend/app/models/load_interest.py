from sqlmodel import Field, SQLModel
from uuid import UUID, uuid4
from datetime import datetime


class LoadInterest(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    load_id: UUID = Field(foreign_key="load.id")
    transporter_id: UUID = Field(foreign_key="user.id")
    company_id: UUID = Field(foreign_key="company.id")
    created_at: datetime = Field(default_factory=datetime.now)

    proposed_price: float | None = None
    message: str | None = None

    status: str = "pending"  # pending | accepted | rejected
    # Additional fields can be added as needed
