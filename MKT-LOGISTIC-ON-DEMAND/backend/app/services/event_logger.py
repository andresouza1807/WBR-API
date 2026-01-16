from sqlmodel import Session
from uuid import uuid4
from typing import Optional

from app.models.event_log import EventLog


def log_event(
    *,
    session: Session,
    company_id: uuid4,
    entity_type: str,
    entity_id: uuid4,
    event_type: str,
    user_id: Optional[uuid4] = None,
    payload: dict | None = None,
) -> EventLog:
    """Log an event to the database."""
    event = EventLog(
        company_id=company_id,
        entity_type=entity_type,
        entity_id=entity_id,
        event_type=event_type,
        user_id=user_id,
        payload=payload or {},
    )
    session.add(event)
    session.commit()
    return event
