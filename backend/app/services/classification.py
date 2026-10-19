# FILE: backend/app/services/classification.py
"""Classification orchestration — the single place AI is invoked.

Responsibilities (and ONLY these):
  1. Build the messages (via T-202's build_messages).
  2. Log any detected injection attempts (advisory, not blocking).
  3. Call the AI client with an enforced timeout.
  4. Parse the result (via T-201b's parse_classification).

Does NOT touch the DB, does NOT know about FastAPI, does NOT decide
status transitions. Those are the endpoint's job (T-203).

Timeout policy is enforced here with asyncio.wait_for, NOT by the
AIClient. Rationale: every future classifier implementation (local
model, remote provider, different HTTP client) shares one policy.
The client-level timeout (httpx) remains as a backstop but is not
the contract.
"""

from __future__ import annotations

import asyncio
import logging

from app.services.ai_client import AIClient, AIClientError
from app.services.ai_mediator import Classification, parse_classification
from app.services.prompt_guard import (
    build_messages,
    detect_injection_attempts,
)

logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT_SECONDS = 8.0


async def classify_request(
    text: str,
    ai_client: AIClient,
    *,
    timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS,
) -> Classification:
    """Classify `text` via `ai_client`, with timeout and fallback.

    Never raises. Any error (transport, timeout, malformed output)
    returns a fallback Classification(category=UNCERTAIN, source="fallback").
    """
    patterns = detect_injection_attempts(text)
    if patterns:
        logger.warning("injection attempts detected: %s", ", ".join(patterns))

    messages = build_messages(text)
    system = messages[0]["content"]
    user = messages[1]["content"]

    try:
        raw = await asyncio.wait_for(
            ai_client.complete(system=system, user=user),
            timeout=timeout_seconds,
        )
    except (asyncio.TimeoutError, AIClientError) as exc:
        logger.warning("ai classification failed (%s): %r", type(exc).__name__, exc)
        # Delegate to the parser with empty input to get the canonical
        # fallback Classification — single source of truth for fallback shape.
        return parse_classification("")

    return parse_classification(raw)
