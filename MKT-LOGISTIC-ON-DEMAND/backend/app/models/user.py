from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime


class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_id: UUID = Field(foreign_key="company.id")
    name: str
    email: str = Field(index=True, unique=True)
    password_hash: str
    role: str  # admin | carrier
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
 #  updated_at: datetime = Field(default_factory=datetime.now, nullable=False)
