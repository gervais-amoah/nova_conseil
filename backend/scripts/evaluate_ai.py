# FILE: backend/scripts/evaluate_ai.py
"""Offline evaluation harness for the AI classifier (T-204).

Usage:
    # Default: uses settings.ai_client_mode (usually "mock")
    uv run python -m backend.scripts.evaluate_ai

    # Explicit mode
    uv run python -m backend.scripts.evaluate_ai --mode local
    uv run python -m backend.scripts.evaluate_ai --mode production

    # Override fixture path
    uv run python -m backend.scripts.evaluate_ai --fixture path/to/file.json

Exit code:
    0  — accuracy >= ACCURACY_GATE (0.85)
    1  — accuracy < gate, or harness error

The harness runs each fixture example through the *production* classify_request()
path (same prompt, same parser, same timeout). Predictions from fallback
(AI offline/error) are counted as category="uncertain", source="fallback",
and flagged in the report with a ⚠ marker so a low score from an offline
model isn't mistaken for a dumb model.

Local models can be `llama-3.1-8b-instruct`, `qwen2.5-7b-instruct`, etc.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from dataclasses import dataclass
from pathlib import Path

from app.services.ai_client import AIClient, make_ai_client
from app.services.ai_mediator import Category
from app.services.classification import classify_request
from pydantic import BaseModel, Field, ValidationError, field_validator

ACCURACY_GATE = 0.85
MIN_FIXTURE_SIZE = 20
DEFAULT_FIXTURE = (
    Path(__file__).resolve().parent.parent
    / "tests"
    / "fixtures"
    / "labeled_requests.json"
)
VALID_CATEGORIES = {"Sales", "Support", "Operations", "Finance", "uncertain"}


# --------------------------------------------------------------------------
# Fixture schema + loading
# --------------------------------------------------------------------------


class LabeledExample(BaseModel):
    """One labeled fixture entry. Pydantic-validated on load."""

    id: str = Field(min_length=1)
    text: str = Field(min_length=1)
    expected_category: str
    notes: str | None = None

    @field_validator("expected_category")
    @classmethod
    def _known_category(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(
                f"unknown category {v!r}; must be one of {sorted(VALID_CATEGORIES)}"
            )
        return v


def load_fixture(path: Path) -> list[LabeledExample]:
    """Load and validate the labeled fixture file.

    Raises:
        ValidationError — a malformed entry.
        ValueError — fewer than MIN_FIXTURE_SIZE entries.
    """
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    examples = [LabeledExample.model_validate(item) for item in raw]
    if len(examples) < MIN_FIXTURE_SIZE:
        raise ValueError(
            f"fixture must contain ≥{MIN_FIXTURE_SIZE} entries, got {len(examples)}"
        )
    return examples


# --------------------------------------------------------------------------
# Metrics (pure functions)
# --------------------------------------------------------------------------


@dataclass(frozen=True)
class ClassMetrics:
    precision: float
    recall: float
    f1: float
    support: int


def overall_accuracy(y_true: list[str], y_pred: list[str]) -> float:
    """Fraction of exact matches. Empty input → 0.0 (never NaN)."""
    if len(y_true) != len(y_pred):
        raise ValueError(
            f"length mismatch: {len(y_true)} true vs {len(y_pred)} predicted"
        )
    if not y_true:
        return 0.0
    correct = sum(1 for t, p in zip(y_true, y_pred) if t == p)
    return correct / len(y_true)


def precision_recall_per_class(
    y_true: list[str], y_pred: list[str]
) -> dict[str, ClassMetrics]:
    """Per-class precision/recall/F1 with zero_division=0 semantics.

    All classes that appear in either y_true or y_pred are included in
    the result, so a reader can see both missed labels and false positives.
    """
    if len(y_true) != len(y_pred):
        raise ValueError(
            f"length mismatch: {len(y_true)} true vs {len(y_pred)} predicted"
        )

    classes = sorted(set(y_true) | set(y_pred))
    out: dict[str, ClassMetrics] = {}
    for c in classes:
        tp = fp = fn = support = 0
        for t, p in zip(y_true, y_pred):
            if t == c:
                support += 1
                if p == c:
                    tp += 1
                else:
                    fn += 1
            elif p == c:
                fp += 1
        precision = tp / (tp + fp) if (tp + fp) else 0.0
        recall = tp / (tp + fn) if (tp + fn) else 0.0
        f1 = (
            (2 * precision * recall) / (precision + recall)
            if (precision + recall)
            else 0.0
        )
        out[c] = ClassMetrics(
            precision=precision, recall=recall, f1=f1, support=support
        )
    return out


# --------------------------------------------------------------------------
# Evaluation orchestration
# --------------------------------------------------------------------------


@dataclass
class ExampleResult:
    id: str
    text: str
    expected: str
    predicted: str
    confidence: float
    source: str  # "ai" | "fallback"
    reasoning: str


@dataclass
class EvaluationResult:
    accuracy: float
    passes_gate: bool
    per_class: dict[str, ClassMetrics]
    examples: list[ExampleResult]


async def run_evaluation(
    examples: list[LabeledExample],
    ai_client: AIClient,
    *,
    gate: float = ACCURACY_GATE,
) -> EvaluationResult:
    """Classify each example via the production path, compute metrics."""
    results: list[ExampleResult] = []
    for ex in examples:
        classification = await classify_request(ex.text, ai_client)
        results.append(
            ExampleResult(
                id=ex.id,
                text=ex.text,
                expected=ex.expected_category,
                predicted=classification.category.value,
                confidence=classification.confidence,
                source=classification.source,
                reasoning=classification.reasoning,
            )
        )

    y_true = [r.expected for r in results]
    y_pred = [r.predicted for r in results]
    accuracy = overall_accuracy(y_true, y_pred)
    metrics = precision_recall_per_class(y_true, y_pred)

    return EvaluationResult(
        accuracy=accuracy,
        passes_gate=accuracy >= gate,
        per_class=metrics,
        examples=results,
    )


def run_evaluation_sync(
    examples: list[LabeledExample],
    ai_client: AIClient,
    *,
    gate: float = ACCURACY_GATE,
) -> EvaluationResult:
    """Sync wrapper for CLI use. Tests use the async version directly."""
    return asyncio.run(run_evaluation(examples, ai_client, gate=gate))


# --------------------------------------------------------------------------
# Report formatting
# --------------------------------------------------------------------------


def format_report(
    metrics: dict[str, ClassMetrics],
    examples: list[ExampleResult],
    *,
    overall: float,
) -> str:
    """Human-readable report. One line per class + one line per failure."""
    lines: list[str] = []
    lines.append("=" * 60)
    lines.append("Per-class metrics")
    lines.append("=" * 60)
    lines.append(
        f"{'class':<14} {'precision':>10} {'recall':>10} {'F1':>10} {'support':>8}"
    )
    lines.append("-" * 60)
    for cls in sorted(metrics):
        m = metrics[cls]
        lines.append(
            f"{cls:<14} {m.precision:>10.3f} {m.recall:>10.3f} "
            f"{m.f1:>10.3f} {m.support:>8}"
        )
    lines.append("")
    lines.append(
        f"Overall accuracy: {overall:.3f} "
        f"({sum(1 for e in examples if e.expected == e.predicted)}"
        f"/{len(examples)})"
    )
    lines.append("")

    failures = [e for e in examples if e.expected != e.predicted]
    if failures:
        lines.append("=" * 60)
        lines.append(f"Failures ({len(failures)})")
        lines.append("=" * 60)
        for e in failures:
            marker = "⚠ " if e.source == "fallback" else "  "
            preview = e.text[:60].replace("\n", " ")
            lines.append(
                f"{marker}{e.id}: expected={e.expected!r} "
                f"predicted={e.predicted!r} "
                f"conf={e.confidence:.2f} src={e.source}"
            )
            lines.append(f"   text: {preview}...")
    return "\n".join(lines)


# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------


def _build_ai_client(mode: str | None) -> AIClient:
    """Construct the AI client for the chosen mode.

    `mode=None` → use settings.ai_client_mode. Any explicit mode overrides
    settings for this run only (does not mutate settings).
    """
    from app.core.config import Settings

    if mode is None:
        return make_ai_client(Settings())
    # Build a throwaway Settings copy with the override.
    base = Settings()
    return make_ai_client(base.model_copy(update={"ai_client_mode": mode}))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Evaluate AI classifier")
    parser.add_argument(
        "--mode",
        choices=["mock", "local", "production"],
        default=None,
        help="AI backend (default: from settings.ai_client_mode)",
    )
    parser.add_argument(
        "--fixture",
        type=Path,
        default=DEFAULT_FIXTURE,
        help=f"Path to labeled fixture (default: {DEFAULT_FIXTURE})",
    )
    args = parser.parse_args(argv)

    try:
        examples = load_fixture(args.fixture)
    except (ValidationError, ValueError, FileNotFoundError) as exc:
        print(f"FATAL: failed to load fixture: {exc}", file=sys.stderr)
        return 1

    ai_client = _build_ai_client(args.mode)
    result = run_evaluation_sync(examples, ai_client)

    print(format_report(result.per_class, result.examples, overall=result.accuracy))
    print()
    if result.passes_gate:
        print(f"PASS  accuracy {result.accuracy:.3f} >= gate {ACCURACY_GATE:.2f}")
        return 0
    print(
        f"FAIL  accuracy {result.accuracy:.3f} < gate {ACCURACY_GATE:.2f}",
        file=sys.stderr,
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
