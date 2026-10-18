# FILE: backend/tests/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker


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
