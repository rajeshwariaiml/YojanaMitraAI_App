"""
Notification Service
====================
Core business logic for the deadline alert system.

Pipeline:
    1. Load the schemes dataset, preferring /dataset/schemes_multilingual.json
       (so Kannada titles are available), falling back to /dataset/schemes.json
       and finally /ml_pipeline/dataset/schemes_sample.json.
    2. Load saved schemes per user from /backend/database/saved_schemes.json.
    3. For each saved scheme, look up its deadline in the dataset.
    4. Compute days_remaining = deadline - today.
    5. Categorize:
         days_remaining  < 0      -> 'expired'
         days_remaining == 0      -> 'today'
         0 < days_remaining <= 7  -> 'upcoming'
         days_remaining  > 7      -> 'far'
    6. Build a human-readable message for each alert (English or Kannada).

Demo mode: when no saved_schemes records exist for the requested user,
the service surfaces every scheme in the dataset whose deadline falls
within the next 7 days, so the Preview always shows alerts.
"""

from __future__ import annotations

import json
import os
from datetime import date, datetime
from typing import Any, Dict, List, Optional

# ---------------------------------------------------------------------------
# Path resolution (project-root aware)
# ---------------------------------------------------------------------------

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

DATASET_MULTI = os.path.join(PROJECT_ROOT, "dataset", "schemes_multilingual.json")
DATASET_PRIMARY = os.path.join(PROJECT_ROOT, "dataset", "schemes.json")
DATASET_FALLBACK = os.path.join(
    PROJECT_ROOT, "ml_pipeline", "dataset", "schemes_sample.json"
)
SAVED_SCHEMES_FILE = os.path.join(BACKEND_DIR, "database", "saved_schemes.json")


# ---------------------------------------------------------------------------
# Loaders
# ---------------------------------------------------------------------------

def _load_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def load_schemes_dataset() -> List[Dict[str, Any]]:
    """Load the schemes catalog. Prefer multilingual, then English, then sample."""
    for path in (DATASET_MULTI, DATASET_PRIMARY, DATASET_FALLBACK):
        if os.path.exists(path):
            return _load_json(path)
    return []


def load_saved_schemes() -> List[Dict[str, Any]]:
    if not os.path.exists(SAVED_SCHEMES_FILE):
        return []
    data = _load_json(SAVED_SCHEMES_FILE)
    if isinstance(data, dict):
        return [data]
    return data


# ---------------------------------------------------------------------------
# Deadline detection
# ---------------------------------------------------------------------------

def _parse_deadline(value: Optional[str]) -> Optional[date]:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def _classify(days_remaining: int) -> str:
    if days_remaining < 0:
        return "expired"
    if days_remaining == 0:
        return "today"
    if days_remaining <= 7:
        return "upcoming"
    return "far"


def _build_message_en(scheme_name: str, days_remaining: int, status: str) -> str:
    if status == "expired":
        return f"Deadline expired for {scheme_name} ({abs(days_remaining)} day(s) ago)"
    if status == "today":
        return f"Last date for {scheme_name} application is today"
    if days_remaining == 1:
        return f"Last date for {scheme_name} application is tomorrow"
    return f"Deadline for {scheme_name} is in {days_remaining} days"


def _build_message_kn(scheme_name_kn: str, days_remaining: int, status: str) -> str:
    if status == "expired":
        return f"ಅಂತಿಮ ದಿನಾಂಕ ಮುಗಿದಿದೆ: {scheme_name_kn} ({abs(days_remaining)} ದಿನ ಹಿಂದೆ)"
    if status == "today":
        return f"ಅಂತಿಮ ದಿನಾಂಕ ಇಂದು: {scheme_name_kn}"
    if days_remaining == 1:
        return f"ಅಂತಿಮ ದಿನಾಂಕ ನಾಳೆ: {scheme_name_kn}"
    return f"ಅಂತಿಮ ದಿನಾಂಕ ಸಮೀಪಿಸುತ್ತಿದೆ: {scheme_name_kn} ({days_remaining} ದಿನಗಳಲ್ಲಿ)"


def _scheme_lookup(schemes: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    out: Dict[str, Dict[str, Any]] = {}
    for s in schemes:
        name = (s.get("scheme_name") or s.get("title_en") or "").strip().lower()
        if name:
            out[name] = s
    return out


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def build_notifications_for_user(
    user_email: Optional[str],
    lang: str = "en",
) -> List[Dict[str, Any]]:
    """Build the notification list. `lang='kn'` returns Kannada titles + messages."""
    schemes = load_schemes_dataset()
    lookup = _scheme_lookup(schemes)

    saved_records = load_saved_schemes()
    today = date.today()
    alerts: List[Dict[str, Any]] = []
    seen: set = set()

    def _push(scheme_meta: Dict[str, Any], deadline: date, record_email: str = ""):
        days_remaining = (deadline - today).days
        status = _classify(days_remaining)
        en_name = scheme_meta.get("scheme_name") or scheme_meta.get("title_en") or "Unknown Scheme"
        kn_name = scheme_meta.get("title_kn") or en_name
        display_name = kn_name if lang == "kn" else en_name
        msg = (
            _build_message_kn(kn_name, days_remaining, status)
            if lang == "kn"
            else _build_message_en(en_name, days_remaining, status)
        )
        alerts.append({
            "scheme_name": display_name,
            "scheme_name_en": en_name,
            "scheme_name_kn": kn_name,
            "deadline": deadline.isoformat(),
            "status": status,
            "days_remaining": days_remaining,
            "message": msg,
            "user_email": record_email,
            "language": lang,
        })

    # 1) Saved schemes for the user
    for record in saved_records:
        record_email = (record.get("user_email") or "").strip().lower()
        if user_email and record_email != user_email:
            continue
        for entry in record.get("saved_schemes", []):
            scheme_name = entry.get("scheme_name", "Unknown Scheme")
            scheme_meta = lookup.get(scheme_name.strip().lower(), {"scheme_name": scheme_name})
            deadline_str = entry.get("deadline") or scheme_meta.get("deadline")
            deadline = _parse_deadline(deadline_str)
            if not deadline:
                continue
            key = (scheme_name.lower(), deadline.isoformat())
            if key in seen:
                continue
            seen.add(key)
            _push(scheme_meta, deadline, record_email)

    # 2) Demo fallback: surface every scheme whose deadline is within 7 days
    #    so the Preview always has alerts to show.
    for s in schemes:
        deadline = _parse_deadline(s.get("deadline"))
        if not deadline:
            continue
        days = (deadline - today).days
        if 0 <= days <= 7:
            name = (s.get("scheme_name") or s.get("title_en") or "").strip().lower()
            key = (name, deadline.isoformat())
            if key in seen:
                continue
            seen.add(key)
            _push(s, deadline)

    def _sort_key(a: Dict[str, Any]):
        priority = {"expired": 0, "today": 1, "upcoming": 2, "far": 3}[a["status"]]
        return (priority, a["days_remaining"])

    alerts.sort(key=_sort_key)
    return alerts
