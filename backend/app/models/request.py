# FILE: backend/app/models/request.py
import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TZDateTime, utcnow

if TYPE_CHECKING:
    from app.models.audit import AuditLog


class RequestStatus(str, enum.Enum):
    RECEIVED = "received"
    CLASSIFYING = "classifying"
    CLASSIFIED = "classified"
    UNCERTAIN = "uncertain"
    ASSIGNED = "assigned"
    RESOLVED = "resolved"


class Request(Base):
    __tablename__ = "requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    reference_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)

    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(320), index=True)
    message: Mapped[str] = mapped_column(Text)

    status: Mapped[RequestStatus] = mapped_column(
        Enum(RequestStatus, native_enum=False, length=20),
        default=RequestStatus.RECEIVED,
        index=True,
    )
    ai_category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    final_category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    human_corrected_flag: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        TZDateTime, default=utcnow, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        TZDateTime, default=utcnow, onupdate=utcnow, server_default=func.now()
    )

    audit_logs: Mapped[list["AuditLog"]] = relationship(
        back_populates="request", cascade="all, delete-orphan"
    )
