from pydantic_settings import BaseSettings


class Loginrequest(BaseSettings):
    username: str
    password: str


class TokenResponse(BaseSettings):
    access_token: str
    token_type: str = "bearer"
