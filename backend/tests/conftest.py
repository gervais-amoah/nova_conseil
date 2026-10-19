# FILE: backend/tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool


@pytest.fixture()
def db_session():
    """Isolated in-memory SQLite session per test.

    Uses StaticPool so the same in-memory DB is shared across connections
    inside a single test, then torn down completely afterward.
    """
    from app.core.database import Base

    # Import models so they register with Base.metadata before create_all
    from app.models import request as _request_model  # noqa: F401
    from sqlalchemy.pool import StaticPool

    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    session: Session = TestSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


@pytest.fixture()
def client():
    """TestClient with isolated in-memory DB and fresh rate limiter per test."""
    from app.api.v1.deps import get_rate_limiter
    from app.core.database import Base, get_db
    from app.core.rate_limiter import RateLimiter
    from app.models import audit as _audit  # noqa: F401
    from app.models import request as _req  # noqa: F401
    from main import app

    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def _get_db_override():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    limiter = RateLimiter(per_second=1, per_day=10)

    app.dependency_overrides[get_db] = _get_db_override
    app.dependency_overrides[get_rate_limiter] = lambda: limiter

    try:
        with TestClient(app) as tc:
            yield tc, TestingSession
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(engine)
        engine.dispose()
