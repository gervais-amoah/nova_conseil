# FILE: backend/scripts/seed_staff.py
from app.core.security import hash_password, verify_password
from app.models.staff import Staff
from sqlalchemy import select
from sqlalchemy.orm import Session


def seed_staff(session: Session, email: str, password: str) -> None:
    """
    Seed a staff user. Idempotent: creates if not exists, updates password if changed.
    """
    result = session.execute(select(Staff).where(Staff.email == email))
    staff = result.scalar_one_or_none()

    if staff is None:
        staff = Staff(email=email, hashed_password=hash_password(password))
        session.add(staff)
    elif not verify_password(password, staff.hashed_password):
        staff.hashed_password = hash_password(password)
