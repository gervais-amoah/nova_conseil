# FILE: backend/tests/test_database.py
from datetime import datetime, timezone

from app.models.audit import AuditLog
from app.models.request import Request, RequestStatus


def test_request_round_trips(db_session):
    req = Request(
        reference_id="REQ-0001",
        name="Ada Lovelace",
        email="ada@example.com",
        message="Need help with a go-to-market strategy.",
        status=RequestStatus.RECEIVED,
    )
    db_session.add(req)
    db_session.commit()

    loaded = db_session.query(Request).filter_by(reference_id="REQ-0001").one()
    assert loaded.id is not None
    assert loaded.name == "Ada Lovelace"
    assert loaded.email == "ada@example.com"
    assert loaded.message.startswith("Need help")
    assert loaded.status == RequestStatus.RECEIVED
    assert loaded.ai_category is None
    assert loaded.final_category is None
    assert loaded.human_corrected_flag is False
    assert isinstance(loaded.created_at, datetime)
    assert isinstance(loaded.updated_at, datetime)


def test_audit_log_links_to_request(db_session):
    req = Request(
        reference_id="REQ-0002",
        name="Grace Hopper",
        email="grace@example.com",
        message="Complex escalation.",
        status=RequestStatus.RECEIVED,
    )
    db_session.add(req)
    db_session.commit()

    log = AuditLog(
        request_id=req.id,
        actor="staff:1",
        action="category_override",
        old_value="Sales",
        new_value="Support",
    )
    db_session.add(log)
    db_session.commit()

    loaded = db_session.query(AuditLog).filter_by(request_id=req.id).one()
    assert loaded.action == "category_override"
    assert loaded.old_value == "Sales"
    assert loaded.new_value == "Support"
    assert loaded.request.reference_id == "REQ-0002"


def test_request_update_persists(db_session):
    req = Request(
        reference_id="REQ-0003",
        name="Alan Turing",
        email="alan@example.com",
        message="Need a workshop.",
        status=RequestStatus.UNCERTAIN,
        ai_category="uncertain",
    )
    db_session.add(req)
    db_session.commit()
    before = req.updated_at

    req.final_category = "Coaching & Training"
    req.human_corrected_flag = True
    db_session.commit()
    db_session.refresh(req)

    loaded = db_session.query(Request).filter_by(reference_id="REQ-0003").one()
    assert loaded.final_category == "Coaching & Training"
    assert loaded.human_corrected_flag is True
    assert loaded.updated_at >= before
