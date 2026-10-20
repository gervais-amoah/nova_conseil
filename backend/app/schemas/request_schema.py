# FILE: backend/app/schemas/request_schema.py
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RequestCreate(BaseModel):
    """Public intake payload. Schema-level guards only — no DB, no AI, no HTTP.

    Guards enforced here:
      - shape (all fields required, correct types)
      - email format
      - size limits (name <= 200, message <= 5000) — DoS guard
      - whitespace-only values rejected (name, message)
    """

    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    message: str = Field(min_length=1, max_length=5000)

    @field_validator("name", "message", mode="before")
    @classmethod
    def _strip_and_reject_whitespace(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("must not be empty or whitespace-only")
        return v


class RequestStatusRead(str, Enum):
    RECEIVED = "received"
    CLASSIFYING = "classifying"
    CLASSIFIED = "classified"
    UNCERTAIN = "uncertain"
    ASSIGNED = "assigned"
    RESOLVED = "resolved"


class RequestRead(BaseModel):
    """Response shape for POST /api/v1/requests (201)."""

    reference_id: str
    status: RequestStatusRead
