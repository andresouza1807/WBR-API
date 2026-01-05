from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.models.load import Load
from app.core.database import get_session
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/loads", tags=["Loads"])


@router.post("/")
def create_load(load: Load, session: Session = Depends(get_session)):
    session.add(load)
    session.commit()
    session.refresh(load)
    return load


@router.get("/{current_user}")
def list_loads(
        current_user: User = Depends(get_current_user),
        session: Session = Depends(get_session)):

    return session.exec(
        select(Load).where(Load.company_id == current_user.company_id)
    ).all()
