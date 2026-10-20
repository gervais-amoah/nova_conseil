# FILE: backend/app/api/v1/endpoints/auth.py
"""Staff authentication: login issues a signed, HttpOnly session cookie.

Deliberate choices:
- Signed cookie via itsdangerous (Phase 3 decision), NOT JWT. Revocable, no refresh dance.
- Wrong password and unknown email return the SAME 401 body. No user enumeration.
- secure=False because dev runs on http://localhost. Must flip to True behind HTTPS in prod.
"""

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, ConfigDict, EmailStr
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.deps import current_staff
from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    SESSION_COOKIE_NAME,
    SESSION_MAX_AGE_SECONDS,
    create_session_token,
    verify_password,
)
from app.models.staff import Staff

router = APIRouter()
_DB_DEPENDENCY = Depends(get_db)
_CURRENT_STAFF_DEPENDENCY = Depends(current_staff)


class LoginPayload(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    email: EmailStr
    password: str


class StaffRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str


@router.post("/auth/login")
async def login(
    payload: LoginPayload,
    response: Response,
    db: Session = _DB_DEPENDENCY,
) -> dict[str, str]:
    staff = db.execute(
        select(Staff).where(Staff.email == payload.email)
    ).scalar_one_or_none()

    # Identical failure for "no such user" and "wrong password" — by design.
    if staff is None or not verify_password(payload.password, staff.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_session_token(staff.id, settings.secret_key)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=SESSION_MAX_AGE_SECONDS,
        httponly=True,
        samesite="lax",
        secure=False,
    )
    return {"status": "ok"}


@router.get("/auth/me")
async def me(staff: Staff = _CURRENT_STAFF_DEPENDENCY) -> StaffRead:
    """Smoke endpoint proving the current_staff dependency resolves a real row."""
    return StaffRead.model_validate(staff)
