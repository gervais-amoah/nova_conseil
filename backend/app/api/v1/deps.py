# FILE: backend/app/api/v1/deps.py
"""FastAPI dependency factories.

Pattern: @lru_cache-decorated factory returns a process-wide singleton,
but remains overridable via app.dependency_overrides in tests.
"""

from functools import lru_cache

from fastapi import Depends, HTTPException, Request
from itsdangerous import BadSignature
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rate_limiter import RateLimiter
from app.services.ai_client import AIClient

_DB_DEPENDENCY = Depends(get_db)


@lru_cache(maxsize=1)
def get_rate_limiter() -> RateLimiter:
    """Process-wide limiter. Limits are read from settings, allowing dev/E2E overrides via .env."""
    from app.core.config import settings

    return RateLimiter(
        per_second=settings.rate_limit_per_second,
        per_day=settings.rate_limit_per_day,
    )


@lru_cache(maxsize=1)
def get_ai_client() -> AIClient:
    """Process-wide AI client, selected by settings.ai_client_mode.

    Same overridable-factory pattern as get_rate_limiter: tests use
    app.dependency_overrides[get_ai_client] to inject a FakeAIClient.
    """
    from app.core.config import settings
    from app.services.ai_client import make_ai_client

    print(f"⚠️⚠️⚠️⚠️ !!!! AI CLIENT MODE: {settings.ai_client_mode}")

    return make_ai_client(settings)


def current_staff(request: Request, db: Session = _DB_DEPENDENCY):
    """Resolve the logged-in Staff from the signed session cookie.

    Raises 401 on: missing cookie, tampered/expired signature, or a staff row
    that no longer exists. Never raises anything else — a bad session is an
    auth failure, not a 500.
    """
    # Imported lazily-by-top-level here is fine: no cycle (endpoints -> deps).
    from app.core.config import settings
    from app.core.security import SESSION_COOKIE_NAME, verify_session_token
    from app.models.staff import Staff

    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        staff_id = verify_session_token(token, settings.secret_key)
    except BadSignature:
        raise HTTPException(status_code=401, detail="Invalid session")

    staff = db.get(Staff, staff_id)
    if staff is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return staff
