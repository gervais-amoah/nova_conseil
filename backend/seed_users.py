import os

from app.core.security import hash_password
from app.models.staff import Staff
from sqlalchemy.orm import Session


def seed_initial_accounts(db: Session):
    # 1. Seed Staff Account
    staff_email = os.getenv("STAFF_SEED_EMAIL", "staff@example.com")
    staff_password = os.getenv("STAFF_SEED_PASSWORD", "SecureStaffPass123!")

    existing_staff = db.query(Staff).filter(Staff.email == staff_email).first()
    if not existing_staff:
        staff_user = Staff(
            email=staff_email,
            hashed_password=hash_password(staff_password),
            role="staff",
        )
        db.add(staff_user)
    else:
        existing_staff.role = "staff"  # Ensure correct role if updating

    # 2. Seed Guest Account
    guest_email = os.getenv("GUEST_SEED_EMAIL", "guest@example.com")
    guest_password = os.getenv("GUEST_SEED_PASSWORD", "SecureGuestPass123!")

    existing_guest = db.query(Staff).filter(Staff.email == guest_email).first()
    if not existing_guest:
        guest_user = Staff(
            email=guest_email,
            hashed_password=hash_password(guest_password),
            role="guest",
        )
        db.add(guest_user)
    else:
        existing_guest.role = "guest"

    db.commit()
