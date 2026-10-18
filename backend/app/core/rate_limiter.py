# FILE: backend/app/core/rate_limiter.py
"""Sliding-window rate limiter, in-memory, thread-safe.

Interface: check(key) -> (allowed, retry_after_seconds)

`check` both evaluates AND records the request if allowed. Calling it twice
consumes budget twice. This is intentional: the endpoint calls it exactly once
per incoming request, and the return value tells the caller whether to proceed.

Production limits (1/sec, 30/day) are injected by the caller — this class
knows nothing about HTTP, IPs, or FastAPI. It's pure interval math on a key.

Swap-in point for Redis later: implement the same `check` signature backed by
Redis ZSET + ZREMRANGEBYSCORE. No caller changes.
"""

from __future__ import annotations

import threading
import time
from collections import deque


class RateLimiter:
    def __init__(
        self,
        per_second: int = 1,
        per_day: int = 30,
        day_seconds: int = 86_400,
    ) -> None:
        if per_second < 1 or per_day < 1:
            raise ValueError("limits must be >= 1")
        self.per_second = per_second
        self.per_day = per_day
        self.day_seconds = day_seconds
        self._hits: dict[str, deque[float]] = {}
        self._lock = threading.Lock()

    def check(self, key: str) -> tuple[bool, float]:
        """Record a hit for `key` if allowed. Returns (allowed, retry_after_s).

        retry_after_s == 0.0 when allowed.
        retry_after_s >  0.0 when blocked: seconds until the next slot frees.
        """
        now = time.monotonic()
        with self._lock:
            hits = self._hits.setdefault(key, deque())
            self._prune(hits, now)

            # Per-second window: how many hits in the last 1s?
            in_second = sum(1 for t in hits if now - t < 1.0)
            if in_second >= self.per_second:
                oldest_in_second = next(t for t in hits if now - t < 1.0)
                return False, max(0.0, 1.0 - (now - oldest_in_second))

            # Per-day window: how many hits in the last day_seconds?
            if len(hits) >= self.per_day:
                oldest_in_day = hits[0]
                return False, max(0.0, self.day_seconds - (now - oldest_in_day))

            hits.append(now)
            return True, 0.0

    def _prune(self, hits: deque[float], now: float) -> None:
        cutoff = now - self.day_seconds
        while hits and hits[0] < cutoff:
            hits.popleft()
