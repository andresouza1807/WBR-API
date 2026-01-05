from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.models.load import Load
from app.core.database import get_session

router = APIRouter(prefix="/loads", tags=["Loads"])


@router.post("/")
def create_load(load: Load, session: Session = Depends(get_session)):
    session.add(load)
    session.commit()
    session.refresh(load)
    return load
