from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    DATABSE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACESS_TOKEN_EXPIRE_MINUTES: int = 60


class Config:
    env_file = ".env"


settings = Settings()
