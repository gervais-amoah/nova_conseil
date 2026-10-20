# FILE: backend/app/api/v1/endpoints/requests.py
import logging
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_ai_client, get_rate_limiter
from app.core.database import get_db
from app.core.rate_limiter import RateLimiter
from app.models.request import Request as RequestModel
from app.models.request import RequestStatus
from app.schemas.request_schema import RequestCreate, RequestRead
from app.services.ai_client import AIClient
from app.services.classification import classify_request

logger = logging.getLogger(__name__)

# Module-level constant so it can be monkeypatched in tests.
# Production value is the source of truth.
AI_CLASSIFICATION_TIMEOUT_SECONDS = 30.0

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
async def create_request(
    payload: RequestCreate,
    request: Request,
    db: Session = Depends(get_db),
    limiter: RateLimiter = Depends(get_rate_limiter),
    ai_client: AIClient = Depends(get_ai_client),
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

    # ---- Classification (T-203) ----------------------------------------
    # The request is persisted before AI runs (Phase 1 invariant: never
    # lose a request because the LLM is down). Public response never
    # reveals the classification; it stays "received" for the caller.
    classification = await classify_request(
        model.message,
        ai_client,
        timeout_seconds=AI_CLASSIFICATION_TIMEOUT_SECONDS,
    )

    try:
        model.status = (
            RequestStatus.UNCERTAIN
            if classification.category.value == "uncertain"
            else RequestStatus.CLASSIFIED
        )
        model.ai_category = classification.category.value
        model.final_category = classification.category.value
        model.ai_confidence = classification.confidence
        model.classifier_source = classification.source
        model.human_corrected_flag = False
        db.commit()
    except Exception as exc:
        # Fail-soft: the request row was persisted before classification.
        # Losing the classification is recoverable (a future sweep can
        # re-classify rows where classifier_source IS NULL); losing the
        # request is not. Public response stays 201.
        logger.error(
            "failed to persist classification for request %s: %r",
            model.reference_id,
            exc,
        )

    # Public view: always "received". The internal state lives in the DB.
    return RequestRead(
        reference_id=model.reference_id,
        status=RequestStatus.RECEIVED.value,
    )
