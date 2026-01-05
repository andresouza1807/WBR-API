from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Definimos valores padrão aqui.
    # Assim, se o .env falhar, o app ainda sobe com SQLite.
    DATABASE_URL: str = "sqlite:///./database.db"
    DATABSE_URL: str = "sqlite:///./database.db"  # Adicionei os dois por segurança
    SECRET_KEY: str = "chave_temporaria_123"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # Isso evita erros se houver outras coisas no .env
    )


settings = Settings()
