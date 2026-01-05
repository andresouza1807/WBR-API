from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.schemas.auth import Loginrequest, TokenResponse
from app.models.user import User, user
from app.core.database import get_session
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(
    data: Loginrequest,
    session: Session = Depends(get_session)
):
    statement = select(User).where(User.email == data.email)
    user = session.exec(statement).first()

    if not user or not verify_password(data.password, User.password_hash):
        raise HTTPException(
            status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(User.id)})

    return TokenResponse(access_token=access_token, token_type="bearer")
