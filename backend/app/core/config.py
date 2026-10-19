# FILE: backend/app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Novae Conseil"
    database_url: str = "sqlite:///./novae.db"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://172.17.192.1:3000",
        "http://127.0.0.1:3000",
    ]


settings = Settings()
