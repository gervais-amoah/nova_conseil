import pytest

# Intentional import of non-existent module to establish RED state
from app.core.security import (
    create_session_token,
    hash_password,
    verify_password,
    verify_session_token,
)
from itsdangerous import BadSignature


def test_hash_and_verify_password_success():
    # Given a plain password
    plain_password = "hunter2"
    # When I hash it and verify the same password
    hashed = hash_password(plain_password)
    result = verify_password(plain_password, hashed)
    # Then it returns True
    assert result is True


def test_hash_and_verify_password_failure():
    # Given a hashed password
    plain_password = "hunter2"
    hashed = hash_password(plain_password)
    # When I verify with a wrong password
    result = verify_password("wrong", hashed)
    # Then it returns False
    assert result is False


def test_session_token_creation_and_verification():
    # Given a secret key and a user ID
    secret_key = "test-secret-key-for-signing"
    user_id = 42
    # When I create a session token and verify it with the same key
    token = create_session_token(user_id, secret_key)
    verified_user_id = verify_session_token(token, secret_key)
    # Then it returns the original user ID
    assert verified_user_id == user_id


def test_session_token_tampering_raises_bad_signature():
    # Given a signed session token created with a specific secret
    secret_key = "test-secret-key-for-signing"
    tampered_secret = "wrong-secret-key"
    user_id = 42
    token = create_session_token(user_id, secret_key)

    # When I attempt to verify it with a different (tampered) secret
    # Then verification raises BadSignature
    with pytest.raises(BadSignature):
        verify_session_token(token, tampered_secret)
