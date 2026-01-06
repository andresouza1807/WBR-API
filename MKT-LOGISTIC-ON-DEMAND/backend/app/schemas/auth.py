from pydantic_settings import BaseSettings


class Loginrequest(BaseSettings):
    email: str
    password: str


class TokenResponse(BaseSettings):
    access_token: str
    token_type: str = "bearer"
