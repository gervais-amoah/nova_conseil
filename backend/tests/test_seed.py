# FILE: backend/tests/test_seed.py
import pytest
from app.core.database import Base
from app.core.security import verify_password
from app.models.staff import Staff
from scripts.seed_staff import seed_staff
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


@pytest.fixture
def seed_db_session():
    """Isolated in-memory DB for seed tests."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    with SessionLocal() as session:
        yield session


def test_seed_creates_staff_row_when_none_exists(seed_db_session):
    # Given an empty DB
    assert seed_db_session.execute(select(Staff)).scalars().all() == []
    # When I seed with email + password
    seed_staff(seed_db_session, "admin@novae.test", "hunter2")
    seed_db_session.commit()
    # Then exactly one staff row exists
    staff = seed_db_session.execute(select(Staff)).scalars().one()
    assert staff.email == "admin@novae.test"
    # And the password is stored hashed (not plain)
    assert staff.hashed_password != "hunter2"
    assert verify_password("hunter2", staff.hashed_password)


def test_seed_is_idempotent_when_run_twice_with_same_inputs(seed_db_session):
    # Given a seeded DB
    seed_staff(seed_db_session, "admin@novae.test", "hunter2")
    seed_db_session.commit()
    first_id = seed_db_session.execute(select(Staff)).scalars().one().id
    # When I seed again with the same email + password
    seed_staff(seed_db_session, "admin@novae.test", "hunter2")
    seed_db_session.commit()
    # Then still exactly one row, same id
    rows = seed_db_session.execute(select(Staff)).scalars().all()
    assert len(rows) == 1
    assert rows[0].id == first_id


def test_seed_updates_password_when_email_exists_but_password_changed(seed_db_session):
    # Given a seeded DB with password "hunter2"
    seed_staff(seed_db_session, "admin@novae.test", "hunter2")
    seed_db_session.commit()
    # When I seed again with the same email but a new password
    seed_staff(seed_db_session, "admin@novae.test", "new-password")
    seed_db_session.commit()
    # Then the row's password matches the new one
    staff = seed_db_session.execute(select(Staff)).scalars().one()
    assert verify_password("new-password", staff.hashed_password)
    assert not verify_password("hunter2", staff.hashed_password)


def test_seed_email_is_unique_constraint(seed_db_session):
    # Given two different emails
    seed_staff(seed_db_session, "a@novae.test", "pw1")
    seed_staff(seed_db_session, "b@novae.test", "pw2")
    seed_db_session.commit()
    # Then two rows exist
    rows = seed_db_session.execute(select(Staff)).scalars().all()
    assert len(rows) == 2
    assert {r.email for r in rows} == {"a@novae.test", "b@novae.test"}
