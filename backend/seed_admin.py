# FILE: backend/seed_admin.py
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.staff import Staff


def seed_admin():
    db = SessionLocal()
    try:
        # 1. Seed Staff Account
        staff_email = settings.staff_seed_email
        staff_password = settings.staff_seed_password

        if not staff_email or not staff_password:
            print(
                "Error: staff_seed_email or staff_seed_password is not set in settings/environment."
            )
            return

        existing_staff = db.query(Staff).filter(Staff.email == staff_email).first()
        if existing_staff:
            print(
                f"Staff member with email '{staff_email}' already exists. Updating password and role..."
            )
            existing_staff.hashed_password = hash_password(staff_password)
            existing_staff.role = "staff"
        else:
            print(f"Creating new staff member: {staff_email}")
            new_staff = Staff(
                email=staff_email,
                hashed_password=hash_password(staff_password),
                role="staff",
            )
            db.add(new_staff)

        # 2. Seed Guest Account (using fallback defaults if env vars aren't defined)
        guest_email = getattr(settings, "guest_seed_email", "guest@example.com")
        guest_password = getattr(settings, "guest_seed_password", "SecureGuestPass123!")

        existing_guest = db.query(Staff).filter(Staff.email == guest_email).first()
        if existing_guest:
            print(
                f"Guest user with email '{guest_email}' already exists. Updating password and role..."
            )
            existing_guest.hashed_password = hash_password(guest_password)
            existing_guest.role = "guest"
        else:
            print(f"Creating new guest user: {guest_email}")
            new_guest = Staff(
                email=guest_email,
                hashed_password=hash_password(guest_password),
                role="guest",
            )
            db.add(new_guest)

        db.commit()
        print("Successfully seeded staff and guest credentials!")
        print(f"Staff Login: {staff_email} (Role: staff)")
        print(f"Guest Login: {guest_email} (Role: guest)")

    except Exception as e:
        db.rollback()
        print(f"Error seeding admin/guest: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
