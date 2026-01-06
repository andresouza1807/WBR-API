from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    DATABASE_URL: str = "postgresql://andre:Ans%40glob2021@localhost:5432/mkt_logistic"
    SECRET_KEY: str = "Ans@glob2021"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60


class Config:
    env_file = ".env"


settings = Settings()
