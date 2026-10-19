# FILE: backend/tests/conftest.py
import app.models  # noqa: F401  — registers all models with Base.metadata
import pytest
from app.api.v1.deps import get_ai_client, get_rate_limiter
from app.core.database import Base, get_db
from app.core.rate_limiter import RateLimiter
from app.models import audit as _audit  # noqa: F401
from app.models import request as _req  # noqa: F401
from fastapi.testclient import TestClient
from main import app
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from tests.fakes.fake_ai_client import FakeAIClient


@pytest.fixture()
def db_session():
    """Isolated in-memory SQLite session per test.

    Uses StaticPool so the same in-memory DB is shared across connections
    inside a single test, then torn down completely afterward.
    """

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
    """TestClient with isolated in-memory DB, fresh rate limiter, and a
    default empty FakeAIClient. Tests that need scripted AI behavior use
    the `ai_client` fixture below to supply their own FakeAIClient."""

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

    # Default AI client: empty fake. Any test that doesn't override
    # get_ai_client will hit this; it raises AIClientError("exhausted"),
    # classify_request catches it, and the request lands at UNCERTAIN with
    # classifier_source="fallback". Loud, observable, never silently "mock".
    from tests.fakes.fake_ai_client import FakeAIClient

    default_fake = FakeAIClient()

    app.dependency_overrides[get_db] = _get_db_override
    app.dependency_overrides[get_rate_limiter] = lambda: limiter
    app.dependency_overrides[get_ai_client] = lambda: default_fake

    try:
        with TestClient(app) as tc:
            yield tc, TestingSession
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(engine)
        engine.dispose()


@pytest.fixture()
def ai_client(client, fake_ai):
    """Convenience: `client` + a scripted FakeAIClient.

    Returns (tc, session_factory, fake_ai). Use `fake_ai.responses = [...]`
    to control the next AI call's outcome.
    """
    tc, session_factory = client
    app.dependency_overrides[get_ai_client] = lambda: fake_ai
    yield tc, session_factory, fake_ai
    # dependency_overrides.clear() in the `client` fixture handles teardown.


@pytest.fixture()
def fake_ai():
    return FakeAIClient()


@pytest.fixture
def db_engine():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture
def db_session_factory(db_engine):
    """Returns a callable producing a fresh Session against the test engine.

    Used by tests that need to observe post-rollback state through a
    different session than the one the endpoint used.
    """

    factory = sessionmaker(bind=db_engine, autoflush=False, autocommit=False)
    yield factory
