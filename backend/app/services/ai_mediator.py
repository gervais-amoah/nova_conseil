# FILE: backend/app/services/ai_mediator.py
"""Classification parsing: untrusted LLM string -> trusted Classification.

Pure logic, no I/O, no async. The async wiring (calling the AIClient,
applying timeouts, persisting results) lands in T-203.

Design notes:
- `parse_classification` NEVER raises. All failures map to a fallback
  Classification(category=UNCERTAIN, confidence=0.0, source="fallback").
  This is the trust boundary; it fails closed, never open.
- The model may legitimately return category="uncertain". That is NOT a
  fallback — it's a valid AI answer with source="ai".
- Extra keys in the JSON are ignored. LLMs add "note", "chain_of_thought",
  etc.; rejecting them would be brittle. The contract is category +
  confidence + reasoning.
- The raw output is logged (WARNING) on every fallback so a bad prompt
  is debuggable from prod logs.
"""

from __future__ import annotations

import json
import logging
import math
from dataclasses import dataclass
from enum import Enum
from typing import Literal

logger = logging.getLogger(__name__)


class Category(str, Enum):
    SALES = "Sales"
    SUPPORT = "Support"
    OPERATIONS = "Operations"
    FINANCE = "Finance"
    UNCERTAIN = "uncertain"


@dataclass(frozen=True)
class Classification:
    category: Category
    confidence: float
    reasoning: str
    source: Literal["ai", "fallback"]


_FALLBACK = Classification(
    category=Category.UNCERTAIN,
    confidence=0.0,
    reasoning="",
    source="fallback",
)

# Wire-string (lowercased) -> enum. "uncertain" is a valid AI answer.
_CATEGORY_LOOKUP: dict[str, Category] = {
    "sales": Category.SALES,
    "support": Category.SUPPORT,
    "operations": Category.OPERATIONS,
    "finance": Category.FINANCE,
    "uncertain": Category.UNCERTAIN,
}


def _fallback(raw: str, reason: str) -> Classification:
    logger.warning("classification fallback (%s): %r", reason, raw)
    return _FALLBACK


def parse_classification(raw: str) -> Classification:
    """Parse an LLM's raw text into a Classification. Never raises."""
    if not isinstance(raw, str) or not raw.strip():
        return _fallback(raw if isinstance(raw, str) else repr(raw), "empty")

    try:
        data = json.loads(raw)
    except (ValueError, TypeError):
        return _fallback(raw, "not-json")

    if not isinstance(data, dict):
        return _fallback(raw, "not-object")

    category_raw = data.get("category")
    if not isinstance(category_raw, str):
        return _fallback(raw, "category-missing-or-non-str")
    category = _CATEGORY_LOOKUP.get(category_raw.strip().lower())
    if category is None:
        return _fallback(raw, "category-unknown")

    confidence_raw = data.get("confidence")
    # Explicit bool check: isinstance(True, int) is True in Python.
    if isinstance(confidence_raw, bool):
        return _fallback(raw, "confidence-bool")
    if not isinstance(confidence_raw, (int, float)):
        return _fallback(raw, "confidence-missing-or-non-num")
    confidence = float(confidence_raw)
    # NaN / Inf are accepted by json.loads but are not valid classifier
    # outputs. isfinite() catches both.
    if not math.isfinite(confidence):
        return _fallback(raw, "confidence-non-finite")
    if not (0.0 <= confidence <= 1.0):
        return _fallback(raw, "confidence-out-of-range")

    reasoning_raw = data.get("reasoning")
    if not isinstance(reasoning_raw, str):
        return _fallback(raw, "reasoning-missing-or-non-str")

    return Classification(
        category=category,
        confidence=confidence,
        reasoning=reasoning_raw,
        source="ai",
    )
