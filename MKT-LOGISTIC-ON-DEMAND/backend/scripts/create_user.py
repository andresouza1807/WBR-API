from sqlmodel import Session

from app.core.database import engine
from app.models.company import Company
from app.models.user import User
from app.core.security import hash_password

with Session(engine) as session:
    # Create a new company
    new_company = Company(name="Example Company")
    session.add(new_company)
    session.commit()
    session.refresh(new_company)

    # Create a new user associated with the company
    new_user = User(
        company_id=new_company.id,
        email="admin@demo.com",
        password_hash=hash_password("123456"),
        role="admin",)

    session.add(new_user)
    session.commit()

    print(
        f"Created user: {new_user.email} with role: {new_user.role} for company: {new_company.name}")
