# FILE: backend/main.py
from app.core.config import settings
from fastapi import FastAPI

app = FastAPI(title=settings.app_name)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
