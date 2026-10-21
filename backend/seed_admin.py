# FILE: backend/seed_admin.py
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.staff import Staff


def seed_admin():
    db = SessionLocal()
    try:
        email = settings.staff_seed_email
        password = settings.staff_seed_password

        if not email or not password:
            print(
                "Error: staff_seed_email or staff_seed_password is not set in settings/environment."
            )
            return

        # Check if staff member already exists
        existing_staff = db.query(Staff).filter(Staff.email == email).first()
        if existing_staff:
            print(
                f"Staff member with email '{email}' already exists. Updating password..."
            )
            existing_staff.hashed_password = hash_password(password)
        else:
            print(f"Creating new staff member: {email}")
            new_staff = Staff(email=email, hashed_password=hash_password(password))
            db.add(new_staff)

        db.commit()
        print("Successfully seeded admin credentials!")
        print(f"Login Email: {email}")
    except Exception as e:
        db.rollback()
        print(f"Error seeding admin: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
