# FILE: backend/app/services/ai_client.py
"""AI client abstraction.

The rest of the codebase depends only on the `AIClient` protocol.
Concrete adapters live here:

  - OpenAICompatibleAIClient : real HTTP adapter for LM Studio (dev),
                                Groq, Together, etc. (prod). Same protocol,
                                different base_url + model.
  - MockAIClient             : deterministic stub for `AI_CLIENT_MODE=mock`.
                                Returns a fixed "uncertain" classification.
                                Used to run the app without any LLM.

Design notes:
- `system` and `user` are passed separately all the way down to the
  HTTP payload. User text is NEVER concatenated into the system prompt.
  That is the whole point of the injection-defense seam in T-202.
- Clients raise `AIClientError` on any failure. They do not decide
  fallbacks; the mediator (T-201b) does.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Protocol, runtime_checkable

import httpx

if TYPE_CHECKING:
    from app.core.config import Settings


class AIClientError(RuntimeError):
    """Raised by AIClient implementations on transport / protocol failure."""


@runtime_checkable
class AIClient(Protocol):
    """Minimal async chat-completion interface.

    Implementations must:
    - Send `system` and `user` as distinct chat messages.
    - Return the assistant's raw text content (may be malformed JSON; the
      mediator is responsible for parsing).
    - Raise `AIClientError` on failure. Never return None.
    """

    async def complete(self, *, system: str, user: str) -> str: ...


class OpenAICompatibleAIClient:
    """HTTP adapter for any OpenAI-compatible `/v1/chat/completions` endpoint.

    Works unchanged against LM Studio (dev), Groq, Together, Fireworks, etc.
    (prod). Only base_url and model differ between environments — the request
    shape and response shape are identical.
    """

    def __init__(
        self,
        *,
        base_url: str,
        model: str,
        timeout: float = 8.0,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        if not base_url:
            raise TypeError("base_url is required for OpenAICompatibleAIClient")
        if not model:
            raise TypeError("model is required for OpenAICompatibleAIClient")
        self._base_url = base_url.rstrip("/")
        self._model = model
        self._timeout = timeout
        self._client = client or httpx.AsyncClient(timeout=timeout)
        self._owns_client = client is None

    async def aclose(self) -> None:
        if self._owns_client:
            await self._client.aclose()

    async def complete(self, *, system: str, user: str) -> str:
        payload = {
            "model": self._model,
            "temperature": 0,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        }
        try:
            resp = await self._client.post(
                f"{self._base_url}/v1/chat/completions",
                json=payload,
            )
        except httpx.HTTPError as exc:
            raise AIClientError(f"transport error: {exc!r}") from exc

        if resp.status_code >= 400:
            raise AIClientError(f"http {resp.status_code}: {resp.text[:200]}")

        try:
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        except (ValueError, KeyError, IndexError, TypeError) as exc:
            raise AIClientError(f"malformed response envelope: {exc!r}") from exc


class MockAIClient:
    """Deterministic stub for local dev without a running LLM.

    Always returns an "uncertain" classification. The reasoning string
    is prefixed with '[mock]' so logs and DB rows make the mode obvious
    at a glance — no chance of confusing mock output with real output.

    NOT used in tests: tests inject `tests.fakes.FakeAIClient` via
    `app.dependency_overrides[get_ai_client]`. This class exists only
    for `AI_CLIENT_MODE=mock` when running the app manually.
    """

    async def complete(self, *, system: str, user: str) -> str:
        return (
            '{"category":"uncertain","confidence":0.0,'
            '"reasoning":"[mock] no LLM configured"}'
        )


def make_ai_client(settings: "Settings") -> AIClient:
    """Single switch point for dev / local / production LLM backends.

    Selected by `Settings.ai_client_mode`:

      - "mock"       : deterministic stub, no network (default for T-203)
      - "local"      : LM Studio at `Settings.lm_studio_base_url`
      - "production" : any OpenAI-compatible endpoint configured via
                       `Settings.production_ai_base_url` / `_model`

    Raises ValueError on unknown mode — fail fast at boot rather than
    silently defaulting, which would hide a typo in env config.
    """
    mode = settings.ai_client_mode
    if mode == "mock":
        return MockAIClient()
    if mode == "local":
        return OpenAICompatibleAIClient(
            base_url=settings.lm_studio_base_url,
            model=settings.lm_studio_model,
        )
    if mode == "production":
        return OpenAICompatibleAIClient(
            base_url=settings.production_ai_base_url,
            model=settings.production_ai_model,
        )
    raise ValueError(
        f"unknown AI_CLIENT_MODE: {mode!r} (expected mock|local|production)"
    )
