# FILE: backend/app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Novae Conseil"
    database_url: str = "sqlite:///./novae.db"


settings = Settings()
