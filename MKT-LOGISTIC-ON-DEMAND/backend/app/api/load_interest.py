from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from uuid import UUID as uuid

from app.core.database import get_session
from app.models.load_interest import LoadInterest
from app.models.load import Load
from app.models.user import User
from app.api.deps import get_current_user
from app.core.events import EventType
from app.services.event_logger import log_event


router = APIRouter(tags=["Load Interest"])


@router.post("/{load_id}/interest", response_model=LoadInterest)
async def apply_for_load(
    load_id: uuid,
    proposed_price: float | None = None,
    message: str | None = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Apply for a load as a transporter."""
    # Check if the load exists
    load = session.get(Load, load_id)
    if not load:
        raise HTTPException(status_code=404, detail="Load not found")

    # Check if the user has already applied for this load
    statement = select(LoadInterest).where(
        LoadInterest.load_id == load_id,
        LoadInterest.transporter_id == current_user.id,
    )
    existing_interest = session.exec(statement).first()
    if existing_interest:
        raise HTTPException(
            status_code=400, detail="You have already applied for this load")

    # Create a new LoadInterest entry
    load_interest = LoadInterest(
        load_id=load_id,
        transporter_id=current_user.id,
        company_id=current_user.company_id,
        proposed_price=proposed_price,
        message=message,
    )
    session.add(load_interest)
    session.commit()
    session.refresh(load_interest)

    return load_interest


@router.get("/{load_id}/interests")
def list_load_interests(
    load_id: uuid,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = select(LoadInterest).where(
        LoadInterest.load_id == load_id,
        LoadInterest.company_id == current_user.company_id,
    )
    return session.exec(statement).all()


@router.post("/accept", response_model=dict)
async def accept_interest(
    interest_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Accept a load interest and assign the load."""
    interest = session.exec(
        select(LoadInterest).where(
            LoadInterest.id == interest_id,
            LoadInterest.company_id == current_user.company_id
        )
    ).first()
    if not interest:
        raise HTTPException(status_code=404, detail="Load interest not found")

    load = session.get(Load, interest.load_id)
    if not load:
        raise HTTPException(status_code=404, detail="Load not found")
    if load.status != "open":
        raise HTTPException(
            status_code=400, detail="Load is not open for accepting interests")

    interest.status = "ACCEPTED"
    load.status = "ASSIGNED"
    load.assigned_transporter_id = interest.transporter_id
    session.add(interest)
    session.add(load)
    session.commit()
    session.refresh(interest)

    # Log event
    log_event(
        session=session,
        company_id=current_user.company_id,
        user_id=current_user.id,
        entity_id=load.id,
        entity_type="load",
        event_type=EventType.LOAD_INTEREST_ACCEPTED,
        payload={
            "interest_id": str(interest.id),
            "proposed_price": interest.proposed_price,
            "transporter_id": str(interest.transporter_id),
        },
    )

    return {"message": "Load interest accepted successfully"}
