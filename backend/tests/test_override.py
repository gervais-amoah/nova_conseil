# FILE: backend/tests/test_override.py
import pytest
from app.core.security import hash_password
from app.models.audit import AuditLog
from app.models.request import Request, RequestStatus
from app.models.staff import Staff
from sqlalchemy import select


@pytest.fixture
def override_client(client):
    """Client fixture with authenticated staff."""
    tc, session_factory = client

    with session_factory() as session:
        staff = Staff(
            email="reviewer@example.com",
            hashed_password=hash_password("reviewer-password"),
        )
        session.add(staff)
        session.commit()
        session.refresh(staff)
        staff_id = staff.id

    login_payload = {"email": "reviewer@example.com", "password": "reviewer-password"}
    login_response = tc.post("/api/v1/auth/login", json=login_payload)
    assert login_response.status_code == 200

    yield tc, session_factory, staff_id


@pytest.fixture
def ai_classified_request(override_client):
    """A request with ai_category='sales' that hasn't been overridden yet."""
    tc, session_factory, _ = override_client

    with session_factory() as session:
        req = Request(
            reference_id="REQ-OVERRIDE01",
            name="Override Test",
            email="customer@example.com",
            message="Please help with sales",
            status=RequestStatus.CLASSIFIED,
            ai_category="sales",
            ai_confidence=0.92,
            classifier_source="ai",
            final_category=None,
            human_corrected_flag=False,
        )
        session.add(req)
        session.commit()
        session.refresh(req)
        req_id = req.id

    yield tc, session_factory, req_id


def test_override_requires_authentication(client):
    tc, _ = client
    # Given no session cookie
    # When I PATCH /api/v1/admin/requests/1/category
    response = tc.patch(
        "/api/v1/admin/requests/1/category", json={"final_category": "support"}
    )
    # Then 401
    assert response.status_code == 401


def test_override_returns_404_for_nonexistent(override_client):
    tc, _, _ = override_client
    # Given a non-existent request ID
    fake_id = 99999
    # When I PATCH /api/v1/admin/requests/{fake_id}/category
    response = tc.patch(
        f"/api/v1/admin/requests/{fake_id}/category",
        json={"final_category": "support"},
    )
    # Then 404 — and it must be the DOMAIN 404, not a routing miss.
    # Without the body assertion this test passes at RED for the wrong reason.
    assert response.status_code == 404
    assert response.json()["detail"] == "Request not found"


def test_override_sets_final_category_and_flips_human_flag(ai_classified_request):
    tc, session_factory, req_id = ai_classified_request
    # Given a request with ai_category='sales' and no final_category
    # When I PATCH with final_category='support'
    response = tc.patch(
        f"/api/v1/admin/requests/{req_id}/category",
        json={"final_category": "support"},
    )
    # Then 200
    assert response.status_code == 200
    data = response.json()
    assert data["final_category"] == "support"
    assert data["human_corrected_flag"] is True
    # And the DB reflects the change
    with session_factory() as session:
        req = session.get(Request, req_id)
        assert req.final_category == "support"
        assert req.human_corrected_flag is True
        # And ai_category is unchanged (we don't rewrite history)
        assert req.ai_category == "sales"


def test_override_creates_audit_log_with_old_and_new_values(ai_classified_request):
    tc, session_factory, req_id = ai_classified_request
    # Given a request with ai_category='sales'
    # When I override to 'support'
    response = tc.patch(
        f"/api/v1/admin/requests/{req_id}/category",
        json={"final_category": "support"},
    )
    assert response.status_code == 200
    # Then an audit_logs row exists
    with session_factory() as session:
        logs = (
            session.execute(select(AuditLog).where(AuditLog.request_id == req_id))
            .scalars()
            .all()
        )
        assert len(logs) == 1
        log = logs[0]
        # And it records actor=staff email, action, old=previous final or AI category, new=final_category
        assert log.actor == "reviewer@example.com"
        assert log.action == "category_override"
        assert log.old_value == "sales"
        assert log.new_value == "support"


def test_override_rejects_empty_final_category(ai_classified_request):
    tc, _, req_id = ai_classified_request
    # Given a whitespace-only final_category
    # When I PATCH
    response = tc.patch(
        f"/api/v1/admin/requests/{req_id}/category",
        json={"final_category": "   "},
    )
    # Then 422 (Pydantic validation)
    assert response.status_code == 422


def test_override_rejects_extra_fields(ai_classified_request):
    tc, _, req_id = ai_classified_request
    # Given a payload with extra fields
    response = tc.patch(
        f"/api/v1/admin/requests/{req_id}/category",
        json={"final_category": "support", "reason": "wrong category"},
    )
    # Then 422 (extra="forbid")
    assert response.status_code == 422


def test_override_re_reoverride_creates_second_audit_log(ai_classified_request):
    tc, session_factory, req_id = ai_classified_request
    # Given I already overrode to 'support'
    tc.patch(
        f"/api/v1/admin/requests/{req_id}/category",
        json={"final_category": "support"},
    )
    # When I override again to 'finance'
    response = tc.patch(
        f"/api/v1/admin/requests/{req_id}/category",
        json={"final_category": "finance"},
    )
    assert response.status_code == 200
    # Then the DB has final_category='finance'
    with session_factory() as session:
        req = session.get(Request, req_id)
        assert req.final_category == "finance"
        # And there are TWO audit log rows
        logs = (
            session.execute(select(AuditLog).where(AuditLog.request_id == req_id))
            .scalars()
            .all()
        )
        assert len(logs) == 2
        # And the second log's old_value is the PREVIOUS FINAL category ('support'),
        # not the AI category ('sales'). Audit tracks the human decision chain.
        second_log = max(logs, key=lambda log: log.id)
        assert second_log.old_value == "support"
        assert second_log.new_value == "finance"
