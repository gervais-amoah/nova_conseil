# FILE: backend/tests/test_auth.py
import pytest
from app.core.security import hash_password
from app.models.staff import Staff


@pytest.fixture
def auth_client(client):
    """Client fixture with a seeded staff user for auth tests."""
    tc, session_factory = client
    with session_factory() as session:
        staff = Staff(
            email="test@example.com",  # <-- Changed from novae.test
            hashed_password=hash_password("correct-password"),
        )
        session.add(staff)
        session.commit()
        session.refresh(staff)
        staff_id = staff.id
    yield tc, session_factory, staff_id


def test_login_with_valid_credentials_returns_200_and_session_cookie(auth_client):
    tc, _, _ = auth_client
    payload = {
        "email": "test@example.com",
        "password": "correct-password",
    }  # <-- Changed
    response = tc.post("/api/v1/auth/login", json=payload)

    if response.status_code != 200:
        print("\n--- 422 Response Body ---")
        print(response.json())
        print("-------------------------")

    assert response.status_code == 200
    assert "set-cookie" in response.headers
    cookie_header = response.headers["set-cookie"]
    assert "httponly" in cookie_header.lower()
    assert "samesite=lax" in cookie_header.lower()
    assert cookie_header.startswith("session=")


def test_login_with_wrong_password_returns_401(auth_client):
    tc, _, _ = auth_client
    payload = {"email": "test@example.com", "password": "wrong-password"}  # <-- Changed
    response = tc.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401


def test_login_with_nonexistent_email_returns_401(auth_client):
    tc, _, _ = auth_client
    payload = {
        "email": "nonexistent@example.com",
        "password": "any-password",
    }  # <-- Changed
    response = tc.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401


def test_current_staff_dependency_raises_401_without_cookie(auth_client):
    tc, _, _ = auth_client
    response = tc.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_current_staff_dependency_returns_staff_with_valid_cookie(auth_client):
    tc, _, staff_id = auth_client
    login_payload = {
        "email": "test@example.com",
        "password": "correct-password",
    }  # <-- Changed
    login_response = tc.post("/api/v1/auth/login", json=login_payload)

    if login_response.status_code != 200:
        print("\n--- Login 422 Response Body ---")
        print(login_response.json())
        print("-------------------------")

    assert login_response.status_code == 200
    response = tc.get("/api/v1/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == staff_id
    assert data["email"] == "test@example.com"  # <-- Changed
