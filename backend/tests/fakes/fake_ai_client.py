# FILE: backend/tests/fakes/fake_ai_client.py
"""In-test AIClient double. Never hits the network."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field

from app.services.ai_client import AIClientError


@dataclass
class FakeAIClient:
    """FIFO-scripted AIClient.

    Pass `responses=[...]` for canned returns; pass `raises=[...]` or
    `delays=[...]` to simulate failures/timeouts per call.
    Every call is recorded in `.calls` for assertions.
    """

    responses: list[str] = field(default_factory=list)
    raises: list[BaseException | None] = field(default_factory=list)
    delays: list[float] = field(default_factory=list)
    calls: list[dict[str, str]] = field(default_factory=list)

    async def complete(self, *, system: str, user: str) -> str:
        idx = len(self.calls)
        self.calls.append({"system": system, "user": user})

        delay = self.delays[idx] if idx < len(self.delays) else 0.0
        if delay:
            await asyncio.sleep(delay)

        if idx < len(self.raises) and self.raises[idx] is not None:
            raise self.raises[idx]

        if idx >= len(self.responses):
            raise AIClientError(
                f"FakeAIClient exhausted at call {idx}; "
                f"provide more responses or raises entries."
            )
        return self.responses[idx]
