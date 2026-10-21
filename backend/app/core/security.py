# FILE: backend/app/core/security.py
"""Session cookie contract. Single source of truth for name + lifetime,
so the login endpoint and the current_staff dependency can never drift apart.
"""

import bcrypt
from itsdangerous import URLSafeTimedSerializer

SESSION_COOKIE_NAME = "session"
SESSION_MAX_AGE_SECONDS = 60 * 60 * 8  # 8 hours


def hash_password(password: str) -> str:
    """Hash a plain text password using bcrypt."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a hashed password."""
    pwd_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)


def create_session_token(user_id: int, secret_key: str) -> str:
    """Create a signed, URL-safe session token for a given user ID."""
    serializer = URLSafeTimedSerializer(secret_key)
    return serializer.dumps(user_id)


def verify_session_token(token: str, secret_key: str) -> int:
    """
    Verify a session token and return the user ID - enforce its maximum lifetime.
    Raises itsdangerous.BadSignature if the token was tampered with.
    """
    serializer = URLSafeTimedSerializer(secret_key)
    return serializer.loads(token, max_age=SESSION_MAX_AGE_SECONDS)
