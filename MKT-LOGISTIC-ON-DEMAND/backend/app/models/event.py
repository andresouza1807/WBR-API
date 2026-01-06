from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime


class Event(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    name: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now, sa_column_kwargs={
                                 "onupdate": datetime.now})
