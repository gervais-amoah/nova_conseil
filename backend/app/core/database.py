# FILE: backend/app/core/database.py
from collections.abc import Generator

# FILE: backend/app/core/database.py  (additions only — keep existing Base/engine/SessionLocal/get_db)
from datetime import datetime, timezone

from sqlalchemy import DateTime, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.types import TypeDecorator

from app.core.config import settings


def utcnow() -> datetime:
    """Timezone-aware UTC now. Single source of truth for default/onupdate."""
    return datetime.now(timezone.utc)


class TZDateTime(TypeDecorator):
    """SQLite-friendly timestamptz.

    SQLite ignores `timezone=True` and returns naive datetimes.
    This decorator normalizes on both sides:
      - on bind: coerce to aware UTC before storing
      - on result: attach UTC tzinfo to naive values from SQLite
    Result: application code always sees aware UTC datetimes,
    regardless of backend.
    """

    impl = DateTime
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)


class Base(DeclarativeBase):
    pass


engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False}
    if settings.database_url.startswith("sqlite")
    else {},
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency: yields a session, closes it on teardown."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
