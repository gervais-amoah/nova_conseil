# FILE: backend/app/models/audit.py
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.request import Request
from sqlalchemy import ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TZDateTime, utcnow


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    request_id: Mapped[int] = mapped_column(
        ForeignKey("requests.id", ondelete="CASCADE"), index=True
    )

    actor: Mapped[str] = mapped_column(String(100))
    action: Mapped[str] = mapped_column(String(50), index=True)
    old_value: Mapped[str | None] = mapped_column(String(500), nullable=True)
    new_value: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        TZDateTime, default=utcnow, server_default=func.now()
    )

    request: Mapped["Request"] = relationship(back_populates="audit_logs")
