# FILE: backend/tests/test_ai_client.py
"""T-201a: AIClient protocol, LM Studio adapter, Fake.

All network is mocked via httpx.MockTransport — this suite runs offline.
"""

from __future__ import annotations

import json

import httpx
import pytest
from app.services.ai_client import (
    AIClient,
    AIClientError,
    OpenAICompatibleAIClient,
)

from tests.fakes.fake_ai_client import FakeAIClient

# ---------------------------------------------------------------- protocol


def test_fake_satisfies_protocol():
    assert isinstance(FakeAIClient(), AIClient)


def test_lmstudio_satisfies_protocol():
    client = OpenAICompatibleAIClient(base_url="http://x", model="m")
    try:
        assert isinstance(client, AIClient)
    finally:
        # synchronous close is fine for a test; no request was made
        client._client = None  # type: ignore[attr-defined]


# ------------------------------------------------------------- Fake client


@pytest.mark.asyncio
async def test_fake_returns_canned_strings_in_order():
    fake = FakeAIClient(responses=["a", "b"])
    assert await fake.complete(system="s", user="u") == "a"
    assert await fake.complete(system="s", user="u") == "b"
    assert len(fake.calls) == 2


@pytest.mark.asyncio
async def test_fake_records_system_and_user_separately():
    fake = FakeAIClient(responses=["ok"])
    await fake.complete(system="SYS", user="USR")
    assert fake.calls == [{"system": "SYS", "user": "USR"}]


@pytest.mark.asyncio
async def test_fake_raises_scripted_exception():
    fake = FakeAIClient(
        responses=[],
        raises=[AIClientError("boom")],
    )
    with pytest.raises(AIClientError, match="boom"):
        await fake.complete(system="s", user="u")


# ----------------------------------------------------- LM Studio adapter


def _mk_adapter(handler) -> OpenAICompatibleAIClient:
    transport = httpx.MockTransport(handler)
    http = httpx.AsyncClient(transport=transport)
    return OpenAICompatibleAIClient(
        base_url="http://lmstudio.local/",
        model="llama-test",
        client=http,
    )


@pytest.mark.asyncio
async def test_adapter_sends_separate_role_messages():
    captured: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        captured["body"] = json.loads(request.content)
        return httpx.Response(
            200,
            json={"choices": [{"message": {"content": '{"ok":true}'}}]},
        )

    adapter = _mk_adapter(handler)
    out = await adapter.complete(system="SYS", user="USR")

    assert out == '{"ok":true}'
    assert captured["url"] == "http://lmstudio.local/v1/chat/completions"
    body = captured["body"]
    assert body["model"] == "llama-test"
    assert body["temperature"] == 0
    assert body["response_format"] == {"type": "json_object"}
    assert body["messages"] == [
        {"role": "system", "content": "SYS"},
        {"role": "user", "content": "USR"},
    ]
    # Injection defense invariant, asserted here so a future refactor
    # that concatenates roles fails loudly:
    assert "USR" not in body["messages"][0]["content"]


@pytest.mark.asyncio
async def test_adapter_raises_on_http_error():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, text="kaboom")

    adapter = _mk_adapter(handler)
    with pytest.raises(AIClientError, match="500"):
        await adapter.complete(system="s", user="u")


@pytest.mark.asyncio
async def test_adapter_raises_on_malformed_envelope():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"unexpected": True})

    adapter = _mk_adapter(handler)
    with pytest.raises(AIClientError, match="malformed"):
        await adapter.complete(system="s", user="u")


@pytest.mark.asyncio
async def test_adapter_raises_on_transport_error():
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("nope")

    adapter = _mk_adapter(handler)
    with pytest.raises(AIClientError, match="transport"):
        await adapter.complete(system="s", user="u")


def test_adapter_requires_base_url():
    with pytest.raises(TypeError):
        OpenAICompatibleAIClient(base_url="", model="m")


def test_adapter_requires_model():
    with pytest.raises(TypeError):
        OpenAICompatibleAIClient(base_url="http://x", model="")
