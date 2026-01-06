from sqlmodel import Session
from app.core.database import engine
from app.models.user import User
from app.models.company import Company
from app.core.security import hash_password

with Session(engine) as session:
    company = Company(name="Empresa Teste")
    session.add(company)
    session.commit()
    session.refresh(company)

    admin = User(
        name="Admin Teste",
        company_id=company.id,
        email="admin@teste.com",
        password_hash=hash_password("123456"),
        role="ADMIN",
    )

    transporter = User(
        name="Transporter Teste",
        company_id=company.id,
        email="transp@teste.com",
        password_hash=hash_password("123456"),
        role="USER",
    )

    session.add(admin)
    session.add(transporter)
    session.commit()

    print("Usuários de teste criados")
