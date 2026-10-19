# FILE: backend/tests/test_evaluate_ai.py
"""T-204: Offline evaluation harness.

Tests the *metrics* and *orchestration* of the eval script, not the LLM.
The end-to-end run uses FakeAIClient — real-LLM evaluation is a manual
run of the script (`--mode local`) and is not part of pytest.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from app.services.ai_client import AIClientError
from app.services.ai_mediator import Category
from scripts.evaluate_ai import (
    ACCURACY_GATE,
    ClassMetrics,
    ExampleResult,
    format_report,
    load_fixture,
    overall_accuracy,
    precision_recall_per_class,
    run_evaluation_sync,
)

from tests.fakes.fake_ai_client import FakeAIClient

FIXTURE_PATH = Path(__file__).parent / "fixtures" / "labeled_requests.json"


# --------------------------------------------------- metric functions


def test_overall_accuracy_empty_returns_zero():
    # The script must produce a number, not crash, on empty input.
    assert overall_accuracy([], []) == 0.0


def test_overall_accuracy_all_correct():
    assert overall_accuracy(["Sales", "Support"], ["Sales", "Support"]) == 1.0


def test_overall_accuracy_all_wrong():
    assert overall_accuracy(["Sales", "Support"], ["Support", "Sales"]) == 0.0


def test_overall_accuracy_mixed():
    # 3 right out of 4
    y_true = ["Sales", "Sales", "Support", "Operations"]
    y_pred = ["Sales", "Sales", "Support", "Finance"]
    assert overall_accuracy(y_true, y_pred) == 0.75


def test_overall_accuracy_length_mismatch_raises():
    with pytest.raises(ValueError, match="length"):
        overall_accuracy(["Sales"], ["Sales", "Support"])


def test_precision_recall_single_class_perfect():
    metrics = precision_recall_per_class(["Sales", "Sales"], ["Sales", "Sales"])
    m: ClassMetrics = metrics["Sales"]
    assert m.precision == 1.0
    assert m.recall == 1.0
    assert m.f1 == 1.0
    assert m.support == 2


def test_precision_recall_with_false_positives_and_negatives():
    # 2 true Sales, 1 predicted as Support (FN for Sales, FP for Support).
    # 1 true Support, predicted as Support (TP for Support).
    y_true = ["Sales", "Sales", "Support"]
    y_pred = ["Sales", "Support", "Support"]
    m = precision_recall_per_class(y_true, y_pred)

    # Sales: TP=1, FP=0, FN=1 → P=1.0, R=0.5, F1=2*(1*0.5)/(1+0.5)=0.6667
    assert m["Sales"].precision == pytest.approx(1.0)
    assert m["Sales"].recall == pytest.approx(0.5)
    assert m["Sales"].f1 == pytest.approx(2 / 3)
    assert m["Sales"].support == 2

    # Support: TP=1, FP=1, FN=0 → P=0.5, R=1.0, F1=2*(0.5*1)/(0.5+1)=0.6667
    assert m["Support"].precision == pytest.approx(0.5)
    assert m["Support"].recall == pytest.approx(1.0)
    assert m["Support"].f1 == pytest.approx(2 / 3)
    assert m["Support"].support == 1


def test_precision_recall_class_with_no_predictions_uses_zero():
    """sklearn convention: zero_division=0. A class with no predictions
    has precision 0.0 (not undefined)."""
    y_true = ["Sales", "Support"]
    y_pred = ["Support", "Support"]
    m = precision_recall_per_class(y_true, y_pred)
    assert m["Sales"].precision == 0.0
    assert m["Sales"].recall == 0.0
    assert m["Sales"].support == 1


def test_precision_recall_includes_all_observed_classes():
    y_true = ["Sales", "Support"]
    y_pred = ["Sales", "Operations"]
    m = precision_recall_per_class(y_true, y_pred)
    assert set(m.keys()) == {"Sales", "Support", "Operations"}


def test_precision_recall_uncertain_is_first_class():
    """'uncertain' is a real class with its own precision/recall."""
    y_true = ["uncertain", "Sales"]
    y_pred = ["uncertain", "uncertain"]
    m = precision_recall_per_class(y_true, y_pred)
    assert m["uncertain"].precision == pytest.approx(0.5)  # 1 TP, 1 FP
    assert m["uncertain"].recall == pytest.approx(1.0)  # 1 TP, 0 FN
    assert m["uncertain"].support == 1


# --------------------------------------------------- report formatting


def test_report_contains_all_classes_and_overall_accuracy():
    y_true = ["Sales", "Support"]
    y_pred = ["Sales", "Support"]
    metrics = precision_recall_per_class(y_true, y_pred)
    examples = [
        ExampleResult(
            id="x1",
            text="t",
            expected="Sales",
            predicted="Sales",
            confidence=0.9,
            source="ai",
            reasoning="r",
        ),
        ExampleResult(
            id="x2",
            text="t",
            expected="Support",
            predicted="Support",
            confidence=0.9,
            source="ai",
            reasoning="r",
        ),
    ]
    report = format_report(metrics, examples, overall=1.0)
    assert "Sales" in report
    assert "Support" in report
    assert "100.0%" in report or "1.000" in report


def test_report_flags_fallback_predictions():
    """Fallback predictions must be visually distinct so a low score
    from an offline model isn't mistaken for a dumb model."""
    metrics = {"uncertain": ClassMetrics(precision=0, recall=0, f1=0, support=0)}
    examples = [
        ExampleResult(
            id="x1",
            text="t",
            expected="Sales",
            predicted="uncertain",
            confidence=0.0,
            source="fallback",
            reasoning="",
        ),
    ]
    report = format_report(metrics, examples, overall=0.0)
    assert "⚠" in report or "fallback" in report.lower()


def test_run_evaluation_is_async_and_wrapper_is_sync():
    import inspect

    from scripts.evaluate_ai import run_evaluation, run_evaluation_sync

    assert inspect.iscoroutinefunction(run_evaluation)
    assert not inspect.iscoroutinefunction(run_evaluation_sync)


# --------------------------------------------------- fixture loading


def test_load_fixture_reads_the_shipped_file():
    examples = load_fixture(FIXTURE_PATH)
    assert len(examples) >= 20
    for ex in examples:
        assert ex.id
        assert ex.text
        assert ex.expected_category in {
            "Sales",
            "Support",
            "Operations",
            "Finance",
            "uncertain",
        }


def test_load_fixture_rejects_unknown_category(tmp_path):
    bad = tmp_path / "bad.json"
    bad.write_text(json.dumps([{"id": "x", "text": "t", "expected_category": "Legal"}]))
    with pytest.raises(Exception):  # ValidationError from Pydantic
        load_fixture(bad)


def test_load_fixture_rejects_too_few_entries(tmp_path):
    small = tmp_path / "small.json"
    small.write_text(
        json.dumps(
            [
                {"id": f"x{i}", "text": "t", "expected_category": "Sales"}
                for i in range(5)
            ]
        )
    )
    with pytest.raises(ValueError, match="20"):
        load_fixture(small)


# --------------------------------------------------- end-to-end orchestration


def test_run_evaluation_perfect_fake_passes_gate():
    """Fake returns each fixture's expected category → accuracy 1.0."""
    examples = load_fixture(FIXTURE_PATH)
    fake = FakeAIClient()
    # Build responses matching each example's expected_category
    fake.responses = [
        json.dumps(
            {
                "category": ex.expected_category,
                "confidence": 0.95,
                "reasoning": "test",
            }
        )
        for ex in examples
    ]

    result = run_evaluation_sync(examples, fake)

    assert result.accuracy == 1.0
    assert result.passes_gate is True
    assert len(result.examples) == len(examples)


def test_run_evaluation_all_uncertain_fake_fails_gate():
    examples = load_fixture(FIXTURE_PATH)
    fake = FakeAIClient()
    fake.responses = [
        json.dumps({"category": "uncertain", "confidence": 0.5, "reasoning": "x"})
        for _ in examples
    ]

    result = run_evaluation_sync(examples, fake)

    # Not all examples are labeled 'uncertain', so accuracy < gate.
    assert result.accuracy < ACCURACY_GATE
    assert result.passes_gate is False


def test_run_evaluation_ai_failure_counts_as_fallback():
    """AI errors must not crash the harness; they count as fallback
    predictions (category='uncertain', source='fallback')."""
    examples = load_fixture(FIXTURE_PATH)
    fake = FakeAIClient()
    fake.responses = []
    fake.raises = [AIClientError("offline") for _ in examples]

    result = run_evaluation_sync(examples, fake)

    # All predictions are fallback → at most the 'uncertain'-labeled
    # examples score correct.
    assert result.passes_gate is False
    assert all(ex.source == "fallback" for ex in result.examples)
