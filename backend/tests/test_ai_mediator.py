# FILE: backend/tests/test_ai_mediator.py
"""T-201b: Classification parser + fallback.

Pure logic. No network, no async, no fake client in this file.
The async wiring lands in T-203; this file only proves the
untrusted-string → trusted-Classification boundary.
"""

from __future__ import annotations

import logging

import pytest
from app.services.ai_mediator import (
    Category,
    Classification,
    parse_classification,
)

FALLBACK = Classification(
    category=Category.UNCERTAIN,
    confidence=0.0,
    reasoning="",
    source="fallback",
)


# ------------------------------------------------------------------ happy


def test_valid_sales_classification():
    raw = '{"category":"Sales","confidence":0.9,"reasoning":"pricing question"}'
    got = parse_classification(raw)
    assert got.category is Category.SALES
    assert got.confidence == 0.9
    assert got.reasoning == "pricing question"
    assert got.source == "ai"


def test_valid_support_classification():
    raw = '{"category":"Support","confidence":1,"reasoning":"bug"}'
    got = parse_classification(raw)
    assert got.category is Category.SUPPORT
    assert got.confidence == 1.0
    assert got.source == "ai"


@pytest.mark.parametrize(
    "raw_category,expected",
    [
        ("sales", Category.SALES),
        ("SALES", Category.SALES),
        ("SuPpOrT", Category.SUPPORT),
        ("operations", Category.OPERATIONS),
        ("Finance", Category.FINANCE),
        ("uncertain", Category.UNCERTAIN),
    ],
)
def test_category_matching_is_case_insensitive(raw_category, expected):
    raw = '{"category":"' + raw_category + '","confidence":0.5,"reasoning":"x"}'
    assert parse_classification(raw).category is expected


def test_model_reported_uncertainty_is_source_ai():
    """Model honestly saying 'uncertain' is not a fallback — it's a valid AI answer."""
    raw = '{"category":"uncertain","confidence":0.2,"reasoning":"ambiguous"}'
    got = parse_classification(raw)
    assert got.category is Category.UNCERTAIN
    assert got.source == "ai"
    assert got.confidence == 0.2


def test_extra_keys_are_ignored():
    raw = (
        '{"category":"Sales","confidence":0.8,"reasoning":"r",'
        '"chain_of_thought":"...","note":"extra"}'
    )
    got = parse_classification(raw)
    assert got.category is Category.SALES
    assert got.source == "ai"


# ------------------------------------------------------------- fallbacks


@pytest.mark.parametrize(
    "raw",
    [
        "",  # empty
        "   \n\t  ",  # whitespace only
        "not json at all",  # not JSON
        "[]",  # JSON but not object
        '"a string"',  # JSON but not object
        "42",  # JSON but not object
        "null",  # JSON null
        "{}",  # missing all fields
        '{"category":"Sales"}',  # no confidence/reasoning
        '{"category":"Sales","confidence":0.9}',  # no reasoning
        '{"category":"Sales","reasoning":"r"}',  # no confidence
        '{"confidence":0.9,"reasoning":"r"}',  # no category
        '{"category":123,"confidence":0.9,"reasoning":"r"}',  # non-str category
        '{"category":"Legal","confidence":0.9,"reasoning":"r"}',  # unknown category
        '{"category":"Sales; DROP TABLE","confidence":0.9,"reasoning":"r"}',
        '{"category":"Sales","confidence":"0.9","reasoning":"r"}',  # str confidence
        '{"category":"Sales","confidence":1.1,"reasoning":"r"}',  # out of range
        '{"category":"Sales","confidence":-0.1,"reasoning":"r"}',  # out of range
        '{"category":"Sales","confidence":0.9,"reasoning":123}',  # non-str reasoning
        '{"category":"Sales","confidence":NaN,"reasoning":"r"}',  # NaN
        '{"category":"Sales","confidence":Infinity,"reasoning":"r"}',  # Inf
        '{"category":"Sales","confidence":0.9,"reasoning":"r"',  # truncated
    ],
)
def test_invalid_inputs_fall_back(raw):
    assert parse_classification(raw) == FALLBACK


def test_bool_confidence_is_rejected():
    """Python footgun: isinstance(True, int) is True. Must reject explicitly."""
    raw = '{"category":"Sales","confidence":true,"reasoning":"r"}'
    assert parse_classification(raw) == FALLBACK


def test_fallback_logs_raw_output(caplog):
    raw = "totally broken output >>>"
    with caplog.at_level(logging.WARNING, logger="app.services.ai_mediator"):
        parse_classification(raw)
    assert any("totally broken output" in rec.getMessage() for rec in caplog.records), (
        f"expected raw output in logs, got: {[r.getMessage() for r in caplog.records]}"
    )


def test_classification_is_frozen():
    c = Classification(
        category=Category.SALES, confidence=0.9, reasoning="r", source="ai"
    )
    with pytest.raises(Exception):  # FrozenInstanceError subclasses AttributeError
        c.confidence = 0.1  # type: ignore[misc]
