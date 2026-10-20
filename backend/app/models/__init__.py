# FILE: backend/app/models/__init__.py
"""Model registry.

Import every model here so SQLAlchemy's declarative registry is fully
populated whenever anything imports from `app.models`. This is required
because `relationship()` uses string-based late resolution: the target
class must be registered in the same mapper configuration pass.

Without this, `uvicorn main:app` would fail on the first request that
touches `Request.audit_logs` (the dev server, unlike conftest.py, has no
reason to import audit.py otherwise).
"""

from app.models.audit import AuditLog
from app.models.request import Request, RequestStatus
from app.models.staff import Staff

__all__ = ["AuditLog", "Request", "RequestStatus", "Staff"]
