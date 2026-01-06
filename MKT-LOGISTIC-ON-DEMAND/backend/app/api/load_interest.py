from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.load_interest import LoadInterest
from app.models.load import Load
from app.models.user import User
from app.models.load_interest import LoadInterest
from app.api.deps import get_current_user


router = APIRouter(prefix="/load", tags=["Load Interests"])


@router.post("/{load_id}/interest", response_model=LoadInterest)
async def appply_for_load(
    load_id: str,
    proposed_price: float | None = None,
    message: str | None = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Check if the load exists
    load = session.get(Load, load_id)
    if not load:
        raise HTTPException(status_code=404, detail="Load not found")

    # Check if the user has already applied for this load
    statement = select(Load).where(
        Load.load_id == load_id,
        Load.company_id == current_user.company_id,
        Load.status == "OPEN",
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


@router.post("/{load_id}/interest", response_model=LoadInterest)
async def appply_for_load(
    load_id: str,
    proposed_price: float | None = None,
    message: str | None = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # # Check if the load exists
    # load = session.get(Load, load_id)
    # if not load:
    #     raise HTTPException(status_code=404, detail="Load not found")

    # # Check if the user has already applied for this load
    # statement = select(LoadInterest).where(
    #     LoadInterest.load_id == load_id,
    #     LoadInterest.transporter_id == current_user.id,
    # )
    # existing_interest = session.exec(statement).first()
    # if existing_interest:
    #     raise HTTPException(
    #         status_code=400, detail="You have already applied for this load")

    # # Create a new LoadInterest entry
    # load_interest = LoadInterest(
    #     load_id=load_id,
    #     transporter_id=current_user.id,
    #     company_id=current_user.company_id,
    #     proposed_price=proposed_price,
    #     message=message,
    # )
    # session.add(load_interest)
    # session.commit()
    # session.refresh(load_interest)

    # return load_interest
    return {"message": "Functionality temporarily disabled."}


def list_load_interests(
    load_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # statement = select(LoadInterest).where(
    #     LoadInterest.load_id == load_id,
    #     LoadInterest.company_id == current_user.company_id,
    # )
    # return session.exec(statement).all()
    return {"message": "Functionality temporarily disabled."}


def accept_load_interest(
    interest_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # load_interest = session.get(LoadInterest, interest_id)
    # if not load_interest:
    #     raise HTTPException(status_code=404, detail="Load interest not found")

    # # Additional checks can be added here (e.g., verifying permissions)

    # load_interest.status = "ACCEPTED"
    # session.add(load_interest)
    # session.commit()
    # session.refresh(load_interest)

    # return load_interest
    return {"message": "Functionality temporarily disabled."}
