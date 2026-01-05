from sqlmodel import SQLModel, create_engine, Session

from app.core.config import settings

from app.models.user import User
from app.models.company import Company
from app.models.load import Load
from app.models.carrier import Carrier
from app.models.vehicle import Vehicle
from app.models.event import Event

engine = create_engine(settings.DATABASE_URL, echo=False)


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
