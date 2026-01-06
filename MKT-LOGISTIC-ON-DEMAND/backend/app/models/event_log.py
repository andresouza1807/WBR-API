from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional
from sqlalchemy import JSON


class EventLog(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)

    company_id: UUID = Field(index=True)
    user_id: Optional[UUID] = Field(default=None, index=True)

    entity_id: UUID = Field(index=True)
    entity_type: str = Field(index=True)

    event_type: str = Field(index=True)

    timestamp: datetime = Field(default_factory=datetime.now)

    payload: dict = Field(sa_column_kwargs={"type": JSON})

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now, sa_column_kwargs={
                                 "onupdate": datetime.now})
