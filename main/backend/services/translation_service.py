"""
Translation Service (Kannada <-> English)
==========================================
Hybrid translator used by the recommendation and notification flows.

Order of operations:
1. Local dictionary lookup (dataset/translation_kn_en.json) — fast, offline,
   guarantees deterministic mapping for the curated vocabulary used by the
   ml_pipeline (it keeps receiving English keywords; ml_pipeline is unchanged).
2. deep-translator (Google) fallback for any residual Kannada tokens that the
   dictionary doesn't cover. Network-failure and import-failure safe — if
   deep-translator is unavailable or raises, we silently fall back to the
   dictionary-only result so the API never crashes.

Public API (unchanged):
    is_kannada(text) -> bool
    translate_kn_to_en(text) -> str
    translate_to_kannada(text) -> str          # NEW: EN -> KN for missing-field fallback
    translate_profile(profile) -> (en_profile, originals)
"""

from __future__ import annotations

import json
import os
import re
from typing import Dict, Optional, Tuple

# Optional dependency. The service degrades gracefully if it's not installed.
try:  # pragma: no cover
    from deep_translator import GoogleTranslator  # type: ignore
    _HAS_DEEP = True
except Exception:  # ImportError or runtime failure
    GoogleTranslator = None  # type: ignore
    _HAS_DEEP = False


_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_PROJECT_ROOT = os.path.dirname(_BACKEND_DIR)
_DICT_PATH = os.path.join(_PROJECT_ROOT, "dataset", "translation_kn_en.json")

_KN_RE = re.compile(r"[\u0C80-\u0CFF]+")
_dict_cache: Optional[Dict[str, str]] = None
_reverse_dict_cache: Optional[Dict[str, str]] = None
# Tiny in-memory LRU-ish cache to avoid hitting the network for repeated phrases.
_translate_cache: Dict[Tuple[str, str, str], str] = {}
_TRANSLATE_CACHE_MAX = 512


# ── Dictionary loading ───────────────────────────────────────────────

def _load_dict() -> Dict[str, str]:
    global _dict_cache
    if _dict_cache is None:
        if os.path.exists(_DICT_PATH):
            with open(_DICT_PATH, "r", encoding="utf-8") as fh:
                _dict_cache = json.load(fh)
        else:
            _dict_cache = {}
    return _dict_cache


def _load_reverse_dict() -> Dict[str, str]:
    global _reverse_dict_cache
    if _reverse_dict_cache is None:
        # Build EN -> KN from the KN -> EN dictionary. Lowercase keys so
        # lookup is case-insensitive.
        forward = _load_dict()
        rev: Dict[str, str] = {}
        for kn, en in forward.items():
            if isinstance(en, str) and en.strip():
                rev[en.strip().lower()] = kn
        _reverse_dict_cache = rev
    return _reverse_dict_cache


# ── Detection helpers ────────────────────────────────────────────────

def is_kannada(text: Optional[str]) -> bool:
    if not text:
        return False
    return bool(_KN_RE.search(text))


# ── deep-translator wrapper (safe) ───────────────────────────────────

def _safe_deep_translate(text: str, source: str, target: str) -> Optional[str]:
    """Attempt a deep-translator call. Return None on any failure."""
    if not _HAS_DEEP or not text or not text.strip():
        return None
    key = (text, source, target)
    if key in _translate_cache:
        return _translate_cache[key]
    try:
        out = GoogleTranslator(source=source, target=target).translate(text)  # type: ignore
        if not isinstance(out, str) or not out.strip():
            return None
        if len(_translate_cache) >= _TRANSLATE_CACHE_MAX:
            _translate_cache.clear()
        _translate_cache[key] = out
        return out
    except Exception:
        return None


# ── KN -> EN ─────────────────────────────────────────────────────────

def translate_kn_to_en(text: Optional[str]) -> str:
    """Translate Kannada tokens in `text` to English.

    Strategy:
      1. Apply curated dictionary (longest-key-first).
      2. If any Kannada tokens remain, ask deep-translator to handle them.
      3. If deep-translator is unavailable/fails, strip remaining Kannada
         characters (legacy behaviour) so the downstream pipeline still
         receives valid English-only text.
    """
    if not text:
        return text or ""
    if not is_kannada(text):
        return text

    mapping = _load_dict()
    result = text
    for kn in sorted(mapping.keys(), key=len, reverse=True):
        if kn in result:
            result = result.replace(kn, f" {mapping[kn]} ")

    if _KN_RE.search(result):
        translated = _safe_deep_translate(result, source="kn", target="en")
        if translated:
            result = translated

    # Final cleanup: drop any leftover Kannada chars and collapse whitespace.
    result = _KN_RE.sub(" ", result)
    result = re.sub(r"\s+", " ", result).strip()
    return result or text


# ── EN -> KN (NEW: used to fill missing _kn fields) ──────────────────

def translate_to_kannada(text: Optional[str]) -> str:
    """Translate an English string to Kannada.

    Used by the recommendation layer to backfill missing `*_kn` fields so
    the strict frontend renderer never has to fall back to English.

    Returns "" if input is empty. Returns the original text only if BOTH
    the local dictionary and deep-translator fail.
    """
    if not text or not isinstance(text, str):
        return ""
    if is_kannada(text):
        return text  # already Kannada — leave alone

    # 1) reverse-dictionary exact match (case-insensitive)
    rev = _load_reverse_dict()
    direct = rev.get(text.strip().lower())
    if direct:
        return direct

    # 2) deep-translator
    translated = _safe_deep_translate(text, source="en", target="kn")
    if translated:
        return translated

    # 3) last-resort: return original so callers can decide what to render
    return text


# ── Profile translation (unchanged contract) ─────────────────────────

def translate_profile(profile: Optional[Dict]) -> Tuple[Optional[Dict], Dict[str, str]]:
    """Return (english_profile, original_kn_fields).

    Only `occupation` and `category` are translated, per spec. Original
    Kannada values are preserved separately so the caller can persist
    both `occupation_original` and `occupation_en`.
    """
    if not profile:
        return profile, {}

    originals: Dict[str, str] = {}
    out = dict(profile)
    for field in ("occupation", "category"):
        val = out.get(field)
        if isinstance(val, str) and is_kannada(val):
            originals[field] = val
            out[field] = translate_kn_to_en(val)
    return out, originals


# ── Convenience wrapper matching the Part 3 spec signature ───────────

def translate_to_kannada_safe(text: str) -> str:
    """Spec-shape wrapper. Never raises."""
    try:
        return translate_to_kannada(text)
    except Exception as e:  # pragma: no cover
        return f"Error: {e}"
