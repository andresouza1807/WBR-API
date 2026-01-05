from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime


class Company(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    cnpj: str | None = None
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.now, nullable=False)
 #  updated_at: datetime = Field(default_factory=datetime.now, nullable=False)
