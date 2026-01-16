from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.schemas.auth import LoginRequest, TokenResponse
from app.models.user import User
from app.models.company import Company
from app.core.database import get_session
from app.core.security import verify_password, create_access_token, hash_password
from app.api.deps import get_current_user
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    session: Session = Depends(get_session)
):
    """Login endpoint that returns JWT token."""
    statement = select(User).where(User.email == data.email)
    user = session.exec(statement).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password")

    access_token = create_access_token({"sub": str(user.id)})

    return TokenResponse(access_token=access_token)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    data: UserCreate,
    session: Session = Depends(get_session)
):
    """Register a new user. Company ID required in UserCreate."""
    # Check if user already exists
    existing_user = session.exec(
        select(User).where(User.email == data.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists")

    # Hash password
    hashed_password = hash_password(data.password)

    # Create user
    user = User(
        name=data.name,
        email=data.email,
        password_hash=hashed_password,
        role=data.role,
        company_id=data.company_id,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user info."""
    return current_user
