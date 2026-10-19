# FILE: backend/tests/test_deps.py
from app.api.v1.deps import get_rate_limiter


def test_get_rate_limiter_returns_singleton():
    """@lru_cache must return the same instance across calls.

    If this ever fails, every request gets a fresh limiter and the
    rate limit is silently disabled in production.
    """
    a = get_rate_limiter()
    b = get_rate_limiter()
    assert a is b
