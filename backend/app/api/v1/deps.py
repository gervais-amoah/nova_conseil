# FILE: backend/app/api/v1/deps.py
"""FastAPI dependency factories.

Pattern: @lru_cache-decorated factory returns a process-wide singleton,
but remains overridable via app.dependency_overrides in tests.
"""

from functools import lru_cache

from app.core.rate_limiter import RateLimiter


@lru_cache(maxsize=1)
def get_rate_limiter() -> RateLimiter:
    """Process-wide limiter. Product limits live here, not in the class default."""
    return RateLimiter(per_second=1, per_day=10)
