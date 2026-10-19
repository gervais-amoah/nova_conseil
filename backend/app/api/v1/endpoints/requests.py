# FILE: backend/app/api/v1/endpoints/requests.py
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_rate_limiter
from app.core.database import get_db
from app.core.rate_limiter import RateLimiter
from app.models.request import Request as RequestModel
from app.models.request import RequestStatus
from app.schemas.request_schema import RequestCreate, RequestRead

router = APIRouter()


def _client_key(request: Request) -> str:
    """Return an opaque key for rate limiting.

    MVP: remote address. Behind a reverse proxy this would need
    X-Forwarded-For trust + parsing — deliberately not done yet.
    """
    return request.client.host if request.client else "unknown"


@router.post(
    "/requests", response_model=RequestRead, status_code=status.HTTP_201_CREATED
)
def create_request(
    payload: RequestCreate,
    request: Request,
    db: Session = Depends(get_db),
    limiter: RateLimiter = Depends(get_rate_limiter),
) -> RequestRead:
    allowed, retry_after = limiter.check(_client_key(request))
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="rate limit exceeded",
            headers={"Retry-After": f"{retry_after:.2f}"},
        )

    model = RequestModel(
        reference_id=f"REQ-{uuid4().hex[:12].upper()}",
        name=payload.name,
        email=str(payload.email),
        message=payload.message,
        status=RequestStatus.RECEIVED,
    )
    db.add(model)
    db.commit()
    db.refresh(model)

    return RequestRead(reference_id=model.reference_id, status=model.status.value)
