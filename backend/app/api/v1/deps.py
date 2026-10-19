# FILE: backend/app/api/v1/deps.py
from app.services.ai_client import AIClient

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


@lru_cache(maxsize=1)
def get_ai_client() -> AIClient:
    """Process-wide AI client, selected by settings.ai_client_mode.

    Same overridable-factory pattern as get_rate_limiter: tests use
    app.dependency_overrides[get_ai_client] to inject a FakeAIClient.
    """
    from app.core.config import settings
    from app.services.ai_client import make_ai_client

    return make_ai_client(settings)
