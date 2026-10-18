# FILE: backend/app/schemas/request_schema.py
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RequestCreate(BaseModel):
    """Public intake payload. Schema-level guards only — no DB, no AI, no HTTP.

    Guards enforced here:
      - shape (all fields required, correct types)
      - email format
      - size limits (name <= 200, message <= 5000) — DoS guard
      - whitespace-only values rejected (name, message)
    """

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    message: str = Field(min_length=1, max_length=5000)

    @field_validator("name", "message")
    @classmethod
    def _reject_whitespace_only(cls, v: str) -> str:
        # str_strip_whitespace=True already trims; if trimming left an empty
        # string, min_length=1 would catch it. But be explicit: a field of
        # spaces is a client bug we want a clear error for, not a length error.
        if not v.strip():
            raise ValueError("must not be empty or whitespace-only")
        return v
