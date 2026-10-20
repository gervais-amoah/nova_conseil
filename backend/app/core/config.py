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

    secret_key: str  # Required! No default. Forces explicit .env configuration.

    # LLM backend switch. One of: "mock" | "local" | "production".
    # Default is "mock" so a fresh clone runs without an LLM.
    ai_client_mode: str = "mock"

    # LM Studio (local dev) — OpenAI-compatible endpoint.
    lm_studio_base_url: str = "http://localhost:1234"
    lm_studio_model: str = "local-model"

    # Production (Groq, Together, Fireworks, …) — OpenAI-compatible endpoint.
    production_ai_base_url: str = "https://api.groq.com/openai"
    production_ai_model: str = "llama-3.1-8b-instant"


settings = Settings()
