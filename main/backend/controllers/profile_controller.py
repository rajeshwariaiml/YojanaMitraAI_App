"""
Profile Controller
==================
Reads/writes user profile data to backend/database/profiles.json.
Used by the FastAPI POST /save-profile and GET /get-profile endpoints.

Kannada support: if `occupation` or `category` arrive in Kannada, the
controller persists BOTH the original Kannada value (`*_original`) and
its English translation (`*_en`), then stores the English value in the
canonical field so the existing ml_pipeline keeps working untouched.
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Optional

from fastapi import HTTPException

from services.translation_service import is_kannada, translate_kn_to_en

PROFILES_FILE = os.path.join(os.path.dirname(__file__), "..", "database", "profiles.json")
PROFILES_FILE = os.path.abspath(PROFILES_FILE)

DEMO_KEY = "__demo__"


def _load_profiles() -> List[Dict[str, Any]]:
    if not os.path.exists(PROFILES_FILE):
        return []
    try:
        with open(PROFILES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def _save_profiles(profiles: List[Dict[str, Any]]) -> None:
    os.makedirs(os.path.dirname(PROFILES_FILE), exist_ok=True)
    with open(PROFILES_FILE, "w", encoding="utf-8") as f:
        json.dump(profiles, f, indent=2, ensure_ascii=False)


def _apply_kannada_normalization(profile: Dict[str, Any]) -> Dict[str, Any]:
    """For occupation & category: if value is Kannada, store original + English."""
    out = dict(profile)
    for field in ("occupation", "category"):
        val = out.get(field)
        if isinstance(val, str) and is_kannada(val):
            en = translate_kn_to_en(val)
            out[f"{field}_original"] = val
            out[f"{field}_en"] = en
            # canonical field becomes the English form so ml_pipeline matches
            out[field] = en
    return out


def save_profile(profile: Dict[str, Any]) -> Dict[str, Any]:
    """Persist a profile to profiles.json, keying by email (or demo if absent)."""
    profile = _apply_kannada_normalization(profile)

    raw_email = (profile.get("email") or "").strip().lower()
    profile["email"] = raw_email or None
    key = raw_email or DEMO_KEY

    profiles = _load_profiles()
    idx = next(
        (
            i
            for i, p in enumerate(profiles)
            if (p.get("email") or DEMO_KEY).lower() == key
        ),
        None,
    )
    if idx is None:
        profiles.append(profile)
    else:
        profiles[idx] = {**profiles[idx], **profile}

    _save_profiles(profiles)
    return {"success": True, "message": "Profile saved", "profile": profile}


def get_profile(email: Optional[str]) -> Dict[str, Any]:
    """Return a saved profile.

    - If `email` is provided, return that profile or 404.
    - If omitted, return the most recently saved profile (demo-friendly).
    """
    profiles = _load_profiles()
    if not profiles:
        raise HTTPException(status_code=404, detail="No profiles saved yet")

    if email:
        email_norm = email.strip().lower()
        profile = next(
            (p for p in profiles if (p.get("email") or "").lower() == email_norm),
            None,
        )
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile

    # No email -> return last saved (works for the single-user demo flow).
    return profiles[-1]
