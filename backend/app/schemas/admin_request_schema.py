# FILE: backend/app/schemas/admin_request_schema.py
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.request_schema import RequestStatusRead


class AdminRequestListItem(BaseModel):
    """Compact view for list endpoint."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    reference_id: str
    name: str
    email: str
    status: RequestStatusRead
    ai_category: str | None
    final_category: str | None
    human_corrected_flag: bool


class AdminRequestDetail(BaseModel):
    """Full view for detail endpoint."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    reference_id: str
    name: str
    email: str
    message: str
    status: RequestStatusRead
    ai_category: str | None
    ai_confidence: float | None
    classifier_source: str | None
    final_category: str | None
    human_corrected_flag: bool


class PaginatedRequests(BaseModel):
    items: list[AdminRequestListItem]
    total: int
    offset: int
    limit: int


class CategoryOverridePayload(BaseModel):
    """Payload for PATCH /admin/requests/{id}/category.

    Guards:
      - final_category required, non-empty, stripped
      - extra fields rejected (extra="forbid")
    """

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    final_category: str = Field(min_length=1, max_length=50)
