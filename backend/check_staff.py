# FILE: backend/check_staff.py
from app.core.database import SessionLocal
from app.models.staff import Staff


def list_staff_emails():
    db = SessionLocal()
    try:
        staff_members = db.query(Staff).all()
        if not staff_members:
            print("No staff members found in the database.")
            return

        print(f"Found {len(staff_members)} staff member(s) in the database:")
        for staff in staff_members:
            print(f" - ID: {staff.id} | Email: {staff.email}")
    finally:
        db.close()


if __name__ == "__main__":
    list_staff_emails()
