from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.models.load import Load
from app.api.deps import get_current_user
from app.models.user import User
from app.core.database import get_session
from app.services.event_logger import log_event
from app.models.event_log import Eventtype


router = APIRouter(prefix="/loads", tags=["Loads"])


@router.get("/")
def list_loads(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return session.exec(
        select(Load).where(Load.company_id == current_user.company_id)
    ).all()


# Depois de salvar a carga.
log_event(
    session=session,
    company_id=current_user.company_id,
    user_id=current_user.id,
    entity_id=load.id,
    entity_type="load",
    event_type=Eventtype.LOAD_CREATED,
    payload={
        "weight": load.weight,
        "origin": load.origin,
    },
)
