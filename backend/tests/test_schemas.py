# FILE: backend/tests/test_schemas.py
import pytest
from app.schemas.request_schema import RequestCreate
from pydantic import ValidationError


def test_valid_request_create_round_trips():
    payload = {
        "name": "Ada Lovelace",
        "email": "ada@example.com",
        "message": "We need help designing a go-to-market strategy for Q1.",
    }
    req = RequestCreate(**payload)
    assert req.name == "Ada Lovelace"
    assert req.email == "ada@example.com"
    assert req.message.startswith("We need help")


def test_invalid_email_is_rejected():
    with pytest.raises(ValidationError) as exc_info:
        RequestCreate(name="Ada", email="not-an-email", message="hello")
    errors = exc_info.value.errors()
    assert any(e["loc"] == ("email",) for e in errors)


def test_oversized_message_is_rejected():
    with pytest.raises(ValidationError) as exc_info:
        RequestCreate(
            name="Ada",
            email="ada@example.com",
            message="x" * 5001,
        )
    errors = exc_info.value.errors()
    assert any(e["loc"] == ("message",) for e in errors)


def test_whitespace_only_name_is_rejected():
    with pytest.raises(ValidationError) as exc_info:
        RequestCreate(
            name="   ",
            email="ada@example.com",
            message="hello",
        )
    errors = exc_info.value.errors()
    assert any(e["loc"] == ("name",) for e in errors)
