# FILE: backend/tests/test_admin_requests.py
import pytest
from app.core.security import hash_password
from app.models.request import Request, RequestStatus
from app.models.staff import Staff
from sqlalchemy import select


@pytest.fixture
def admin_client(client):
    """Client fixture with authenticated staff and seeded requests."""
    tc, session_factory = client

    # Seed staff user
    with session_factory() as session:
        staff = Staff(
            email="admin@example.com", hashed_password=hash_password("admin-password")
        )
        session.add(staff)
        session.commit()
        session.refresh(staff)
        staff_id = staff.id

    # Login to get session cookie
    login_payload = {"email": "admin@example.com", "password": "admin-password"}
    login_response = tc.post("/api/v1/auth/login", json=login_payload)
    assert login_response.status_code == 200

    yield tc, session_factory, staff_id


@pytest.fixture
def seeded_requests(admin_client):
    """Create a batch of requests with various statuses."""
    tc, session_factory, _ = admin_client

    with session_factory() as session:
        # 3 uncertain requests
        for i in range(3):
            req = Request(
                reference_id=f"REQ-UNCERTAIN{i:02d}",
                name=f"Uncertain Request {i}",
                email=f"uncertain{i}@example.com",
                message=f"Message {i}",
                status=RequestStatus.UNCERTAIN,
                ai_category="uncertain",
                ai_confidence=0.0,
                ai_reasoning="r",  # RRR
                classifier_source="fallback",
            )
            session.add(req)

        # 2 classified requests
        for i in range(2):
            req = Request(
                reference_id=f"REQ-CLASSIFIED{i:02d}",
                name=f"Classified Request {i}",
                email=f"classified{i}@example.com",
                message=f"Message {i}",
                status=RequestStatus.CLASSIFIED,
                ai_category="sales",
                ai_confidence=0.95,
                ai_reasoning="r",  # RRR
                classifier_source="ai",
            )
            session.add(req)

        # 1 received request
        req = Request(
            reference_id="REQ-RECEIVED00",
            name="Received Request",
            email="received@example.com",
            message="Just received",
            status=RequestStatus.RECEIVED,
        )
        session.add(req)

        session.commit()

    yield tc, session_factory


def test_admin_requests_requires_authentication(client):
    tc, _ = client
    # Given no session cookie
    # When I GET /api/v1/admin/requests
    response = tc.get("/api/v1/admin/requests")
    # Then 401
    assert response.status_code == 401


def test_admin_requests_returns_paginated_list(seeded_requests):
    tc, _ = seeded_requests
    # Given 6 requests in DB
    # When I GET /api/v1/admin/requests
    response = tc.get("/api/v1/admin/requests")
    # Then 200
    assert response.status_code == 200
    data = response.json()
    # And response has pagination structure
    assert "items" in data
    assert "total" in data
    assert "offset" in data
    assert "limit" in data
    # And total is 6
    assert data["total"] == 6
    # And items array has all 6 (default limit is 20)
    assert len(data["items"]) == 6
    # And offset/limit match defaults
    assert data["offset"] == 0
    assert data["limit"] == 20


def test_admin_requests_filters_by_status(seeded_requests):
    tc, _ = seeded_requests
    # Given 3 uncertain requests
    # When I GET /api/v1/admin/requests?status=uncertain
    response = tc.get("/api/v1/admin/requests?status=uncertain")
    # Then 200
    assert response.status_code == 200
    data = response.json()
    # And total is 3
    assert data["total"] == 3
    # And all items have status=uncertain
    for item in data["items"]:
        assert item["status"] == "uncertain"


def test_admin_requests_supports_pagination(seeded_requests):
    tc, _ = seeded_requests
    # Given 6 requests
    # When I GET /api/v1/admin/requests?offset=2&limit=3
    response = tc.get("/api/v1/admin/requests?offset=2&limit=3")
    # Then 200
    assert response.status_code == 200
    data = response.json()
    # And total is still 6
    assert data["total"] == 6
    # And items array has 3 items
    assert len(data["items"]) == 3
    # And offset/limit match request
    assert data["offset"] == 2
    assert data["limit"] == 3


def test_admin_requests_detail_requires_authentication(client):
    tc, _ = client
    # Given no session cookie
    # When I GET /api/v1/admin/requests/REQ-FAKE00
    response = tc.get("/api/v1/admin/requests/REQ-FAKE00")
    # Then 401
    assert response.status_code == 401


def test_admin_requests_detail_returns_full_request(seeded_requests):
    tc, session_factory = seeded_requests
    # Given a request exists
    with session_factory() as session:
        req = session.execute(
            select(Request).where(Request.reference_id == "REQ-CLASSIFIED00")
        ).scalar_one()
        req_id = req.id

    # When I GET /api/v1/admin/requests/{id}
    response = tc.get(f"/api/v1/admin/requests/{req_id}")
    # Then 200
    assert response.status_code == 200
    data = response.json()
    # And response has all request fields
    assert data["id"] == req_id
    assert data["reference_id"] == "REQ-CLASSIFIED00"
    assert data["name"] == "Classified Request 0"
    assert data["email"] == "classified0@example.com"
    assert data["message"] == "Message 0"
    assert data["status"] == "classified"
    assert data["ai_category"] == "sales"
    assert data["ai_confidence"] == 0.95
    assert data["ai_reasoning"] == "r"  # rrr
    assert data["classifier_source"] == "ai"
    assert data["final_category"] is None
    assert data["human_corrected_flag"] is False


def test_admin_requests_detail_returns_404_for_nonexistent(seeded_requests):
    tc, _ = seeded_requests
    # Given a non-existent request ID
    fake_id = 99999
    # When I GET /api/v1/admin/requests/{fake_id}
    response = tc.get(f"/api/v1/admin/requests/{fake_id}")
    # Then 404
    assert response.status_code == 404
