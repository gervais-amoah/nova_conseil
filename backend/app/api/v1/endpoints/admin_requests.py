# FILE: backend/app/api/v1/endpoints/admin_requests.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.v1.deps import current_staff
from app.core.database import get_db
from app.models.audit import AuditLog
from app.models.request import Request, RequestStatus
from app.models.staff import Staff
from app.schemas.admin_request_schema import (
    AdminRequestDetail,
    AdminRequestListItem,
    CategoryOverridePayload,
    PaginatedRequests,
    StatusTransitionPayload,
)

router = APIRouter()
_DB_DEPENDENCY = Depends(get_db)
_CURRENT_STAFF_DEPENDENCY = Depends(current_staff)
_STATUS_QUERY = Query(default=None)


@router.get("/admin/requests")
async def list_requests(
    status: RequestStatus | None = _STATUS_QUERY,
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = _DB_DEPENDENCY,
    current_staff: Staff = _CURRENT_STAFF_DEPENDENCY,
) -> PaginatedRequests:
    query = select(Request)
    count_query = select(func.count(Request.id))

    if status is not None:
        query = query.where(Request.status == status)
        count_query = count_query.where(Request.status == status)

    total = db.execute(count_query).scalar_one()
    items = (
        db.execute(
            query.offset(offset).limit(limit).order_by(Request.created_at.desc())
        )
        .scalars()
        .all()
    )

    return PaginatedRequests(
        items=[AdminRequestListItem.model_validate(item) for item in items],
        total=total,
        offset=offset,
        limit=limit,
    )


@router.get("/admin/requests/{request_id}")
async def get_request(
    request_id: int,
    db: Session = _DB_DEPENDENCY,
    current_staff: Staff = _CURRENT_STAFF_DEPENDENCY,
) -> AdminRequestDetail:
    request = db.get(Request, request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return AdminRequestDetail.model_validate(request)


@router.patch("/admin/requests/{request_id}/category")
async def override_category(
    request_id: int,
    payload: CategoryOverridePayload,
    db: Session = _DB_DEPENDENCY,
    current_staff: Staff = _CURRENT_STAFF_DEPENDENCY,
) -> AdminRequestDetail:
    """Override the AI classification with a human decision.

    Records an audit log tracking the decision chain:
      - old_value = previous final_category if set, else ai_category
      - new_value = payload.final_category
    This allows reconstructing the full override history.
    """
    request = db.get(Request, request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Request not found")

    # Determine old_value: prefer existing final_category, fall back to ai_category
    old_value = (
        request.final_category
        if request.final_category is not None
        else request.ai_category
    )

    # Apply the override
    request.final_category = payload.final_category
    request.human_corrected_flag = True

    # Create audit log
    audit_log = AuditLog(
        request_id=request.id,
        actor=current_staff.email,
        action="category_override",
        old_value=old_value,
        new_value=payload.final_category,
    )
    db.add(audit_log)

    db.commit()
    db.refresh(request)

    return AdminRequestDetail.model_validate(request)


# Only staff-controlled transitions belong here.
ALLOWED_STATUS_TRANSITIONS: dict[RequestStatus, set[RequestStatus]] = {
    RequestStatus.CLASSIFIED: {RequestStatus.ASSIGNED},
    RequestStatus.UNCERTAIN: {RequestStatus.ASSIGNED},
    RequestStatus.ASSIGNED: {RequestStatus.RESOLVED},
}


@router.patch(
    "/admin/requests/{request_id}/status",
    response_model=AdminRequestDetail,
)
async def transition_request_status(
    request_id: int,
    payload: StatusTransitionPayload,
    db: Session = _DB_DEPENDENCY,
    current_staff: Staff = _CURRENT_STAFF_DEPENDENCY,
) -> AdminRequestDetail:
    """Apply an allowed staff status transition and record an audit event."""
    request = db.get(Request, request_id)

    if request is None:
        raise HTTPException(
            status_code=404,
            detail="Request not found",
        )

    old_status = request.status
    new_status = RequestStatus(payload.status)

    # Idempotent retries should not create duplicate audit events.
    if old_status == new_status:
        return AdminRequestDetail.model_validate(request)

    allowed_targets = ALLOWED_STATUS_TRANSITIONS.get(old_status, set())

    if new_status not in allowed_targets:
        old_value = (
            old_status.value
            if isinstance(old_status, RequestStatus)
            else str(old_status)
        )

        raise HTTPException(
            status_code=409,
            detail=(
                f"Cannot transition request from '{old_value}' to '{new_status.value}'."
            ),
        )

    old_value = old_status.value

    try:
        request.status = new_status

        db.add(
            AuditLog(
                request_id=request.id,
                actor=current_staff.email,
                action="status_change",
                old_value=old_value,
                new_value=new_status.value,
            )
        )

        db.commit()
        db.refresh(request)

    except Exception:
        db.rollback()
        raise

    return AdminRequestDetail.model_validate(request)
