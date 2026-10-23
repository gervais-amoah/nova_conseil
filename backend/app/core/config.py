# FILE: backend/app/core/config.py
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # These will be overridden by the string in .env, then parsed into a list

    secret_key: str  # Required!
    cors_origins: list[str]

    app_name: str = "Novae Conseil"
    database_url: str = "sqlite:///./novae.db"

    staff_seed_email: str
    staff_seed_password: str

    ai_client_mode: str
    lm_studio_base_url: str
    lm_studio_model: str
    production_ai_model: str
    production_ai_api_key: str
    production_ai_base_url: str

    rate_limit_per_second: int
    rate_limit_per_day: int

    # This validator ensures that if the .env provides a string,
    # it gets split into a Python list.
    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        raise ValueError("CORS origins must be a comma-separated string or a list")


settings = Settings()
