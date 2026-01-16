from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session, select
from uuid import UUID as uuid

from app.core.config import settings
from app.core.database import get_session
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY,
                             algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        company_id: str = payload.get("company_id")
        roles: str = payload.get("roles")

        if not user_id:
            raise HTTPException(
                status_code=401, detail="User ID missing in token")

        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    try:
        user_uuid = uuid(user_id)
    except (ValueError, AttributeError):
        raise credentials_exception

    statement = select(User).where(User.id == user_uuid)
    user = session.exec(statement).first()

    if user is None:
        raise credentials_exception

    return user
