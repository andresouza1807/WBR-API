from pydantic import BaseSettings


class Settings(BaseSettings):
    DATABSE_URL: str = "sqlite:///./test.db"
    SECRET_KEY: str = "your_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60


settings = Settings()
