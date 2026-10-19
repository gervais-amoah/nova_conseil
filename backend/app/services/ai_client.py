# FILE: backend/app/services/ai_client.py
"""AI client abstraction.

The rest of the codebase depends only on the `AIClient` protocol.
Concrete adapters (LM Studio local, Groq prod) live here.

Design notes:
- `system` and `user` are passed separately all the way down to the
  HTTP payload. User text is NEVER concatenated into the system prompt.
  That is the whole point of the injection-defense seam in T-202.
- The client raises `AIClientError` on any failure. It does not decide
  fallbacks; the mediator (T-201b) does.
"""

from __future__ import annotations

from typing import Protocol, runtime_checkable

import httpx


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


class LMStudioAIClient:
    """OpenAI-compatible adapter. Works against LM Studio's `/v1/chat/completions`.

    Also works unchanged against Groq's free tier later — that is why we
    depend on the protocol, not this class.
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
            raise TypeError("base_url is required for LMStudioAIClient")
        if not model:
            raise TypeError("model is required for LMStudioAIClient")
        self._base_url = base_url.rstrip("/")
        self._model = model
        self._timeout = timeout
        # A caller may inject a client (tests use httpx.MockTransport).
        # Otherwise we create one per adapter instance and reuse it.
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
