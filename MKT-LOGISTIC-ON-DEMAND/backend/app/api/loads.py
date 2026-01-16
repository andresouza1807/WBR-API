from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from uuid import UUID as uuid

from app.models.load import Load
from app.api.deps import get_current_user
from app.models.user import User
from app.core.database import get_session
from app.services.event_logger import log_event
from app.schemas.load import LoadCreate, LoadUpdate, LoadResponse
from app.core.events import EventType

router = APIRouter(prefix="/loads", tags=["Loads"])


@router.get("/", response_model=list[LoadResponse])
def list_loads(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """List all loads for the current company."""
    return session.exec(
        select(Load).where(Load.company_id == current_user.company_id)
    ).all()


@router.post("/", response_model=LoadResponse)
def create_load(
    load_data: LoadCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new load."""
    load = Load(
        company_id=current_user.company_id,
        created_by=current_user.id,
        **load_data.model_dump()
    )
    session.add(load)
    session.commit()
    session.refresh(load)

    # Log event
    try:
        log_event(
            session=session,
            company_id=current_user.company_id,
            user_id=current_user.id,
            entity_id=load.id,
            entity_type="load",
            event_type=EventType.LOAD_CREATED,
            payload={
                "title": load.title,
                "weight_kg": load.weight_kg,
                "volume_m3": load.volume_m3,
            },
        )
    except Exception as e:
        print(f"Error logging event: {e}")

    return load


@router.get("/{load_id}", response_model=LoadResponse)
def get_load(
    load_id: uuid,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a specific load."""
    load = session.get(Load, load_id)
    if not load or load.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="Load not found")
    return load


@router.patch("/{load_id}", response_model=LoadResponse)
def update_load(
    load_id: uuid,
    load_data: LoadUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a load."""
    load = session.get(Load, load_id)
    if not load or load.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="Load not found")

    update_data = load_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(load, key, value)

    session.add(load)
    session.commit()
    session.refresh(load)
    return load


@router.delete("/{load_id}")
def delete_load(
    load_id: uuid,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a load."""
    load = session.get(Load, load_id)
    if not load or load.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="Load not found")

    session.delete(load)
    session.commit()
    return {"message": "Load deleted successfully"}
