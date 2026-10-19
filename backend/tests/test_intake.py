# FILE: backend/tests/test_intake.py

VALID_PAYLOAD = {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "message": "Need help designing a go-to-market strategy for Q1.",
}


def test_valid_request_returns_201_and_persists(client):
    tc, session_factory = client
    resp = tc.post("/api/v1/requests", json=VALID_PAYLOAD)

    assert resp.status_code == 201
    body = resp.json()
    assert "reference_id" in body
    assert body["reference_id"].startswith("REQ-")
    assert body["status"] == "received"

    with session_factory() as db:
        from app.models.request import Request, RequestStatus

        rows = db.query(Request).all()
        assert len(rows) == 1
        row = rows[0]
        assert row.reference_id == body["reference_id"]
        assert row.email == "ada@example.com"
        assert row.status == RequestStatus.RECEIVED


def test_invalid_email_returns_422(client):
    tc, _ = client
    bad = {**VALID_PAYLOAD, "email": "not-an-email"}
    resp = tc.post("/api/v1/requests", json=bad)
    assert resp.status_code == 422
    errors = resp.json()["detail"]
    assert any("email" in str(e.get("loc", [])) for e in errors)


def test_rate_limit_returns_429_with_retry_after(client):
    tc, session_factory = client
    first = tc.post("/api/v1/requests", json=VALID_PAYLOAD)
    assert first.status_code == 201

    second = tc.post("/api/v1/requests", json=VALID_PAYLOAD)
    assert second.status_code == 429
    assert "Retry-After" in second.headers
    retry_after = float(second.headers["Retry-After"])
    assert 0 < retry_after <= 1.0

    from app.models.request import Request

    with session_factory() as db:
        assert db.query(Request).count() == 1, (
            "429 must not persist; limiter check must precede DB write"
        )


def test_extra_field_is_rejected(client):
    tc, _ = client
    payload = {**VALID_PAYLOAD, "admin": True}
    resp = tc.post("/api/v1/requests", json=payload)
    assert resp.status_code == 422
