from pydantic_settings import BaseSettings
from uuid import UUID


class Loginrequest(BaseSettings):
    def __init__(self, **data):
        super().__init__(**data)
    email: str
    password: str


class TokenResponse(BaseSettings):
    access_token: str
    token_type: str = "bearer"
