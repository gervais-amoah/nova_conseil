# FILE: backend/tests/test_rate_limiter.py
from app.core.rate_limiter import RateLimiter
from freezegun import freeze_time


def test_second_call_within_one_second_is_rejected():
    with freeze_time("2026-01-01 12:00:00") as clock:
        limiter = RateLimiter(per_second=1, per_day=30)
        ok, retry_after = limiter.check("1.2.3.4")
        assert ok is True
        assert retry_after == 0

        clock.tick(0.5)
        ok, retry_after = limiter.check("1.2.3.4")
        assert ok is False
        assert 0.4 <= retry_after <= 0.6


def test_second_window_resets_after_one_second():
    with freeze_time("2026-01-01 12:00:00") as clock:
        limiter = RateLimiter(per_second=1, per_day=30)
        assert limiter.check("1.2.3.4")[0] is True
        clock.tick(1.01)
        assert limiter.check("1.2.3.4")[0] is True


def test_31st_call_within_24h_is_rejected():
    with freeze_time("2026-01-01 00:00:00") as clock:
        limiter = RateLimiter(per_second=1, per_day=30)
        for _ in range(30):
            ok, _ = limiter.check("1.2.3.4")
            assert ok is True, "first 30 calls must be allowed"
            clock.tick(2)  # 2s apart → second-window never blocks

        ok, retry_after = limiter.check("1.2.3.4")
        assert ok is False
        assert retry_after > 0


def test_day_window_resets_after_24h():
    with freeze_time("2026-01-01 00:00:00") as clock:
        limiter = RateLimiter(per_second=1, per_day=30)
        for _ in range(30):
            limiter.check("1.2.3.4")
            clock.tick(2)
        assert limiter.check("1.2.3.4")[0] is False

        # Advance past the oldest request in the 24h window
        clock.tick(24 * 3600)
        assert limiter.check("1.2.3.4")[0] is True


def test_per_key_isolation():
    with freeze_time("2026-01-01 12:00:00"):
        limiter = RateLimiter(per_second=1, per_day=30)
        assert limiter.check("A")[0] is True
        assert limiter.check("A")[0] is False  # A exhausted its per-second
        assert limiter.check("B")[0] is True  # B unaffected
