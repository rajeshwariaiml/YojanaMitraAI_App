"""
Input Validation Utilities
==========================
Centralised guards for free-text user queries:

- looks_like_gibberish(text): heuristic to reject inputs like "asdfg".
- is_meaningful_query(text):  short, valid keywords ("SC", "ST", "BPL")
                              are preserved; nonsense is rejected.

These helpers are used by the recommend route to short-circuit obvious
garbage with a clear 400 instead of letting the ML pipeline waste cycles
on it.
"""

from __future__ import annotations
import re

# Tokens we always allow even though they're very short.
_WHITELIST = {
    "sc", "st", "obc", "bpl", "apl", "ews", "phd", "iti",
    "ml", "kn", "en", "ssc", "hsc", "ug", "pg",
}

_KN_RE = re.compile(r"[\u0C80-\u0CFF]")
_LATIN_VOWEL_RE = re.compile(r"[aeiou]", re.IGNORECASE)
_LATIN_RE = re.compile(r"[A-Za-z]")
_REPEAT_RE = re.compile(r"(.)\1{3,}")  # aaaa, !!!!


def _has_kannada(text: str) -> bool:
    return bool(_KN_RE.search(text))


def looks_like_gibberish(text: str) -> bool:
    """Heuristic gibberish detector for English-only inputs.

    Returns False (i.e. "looks fine") for:
      - Any text containing Kannada characters
      - Whitelisted short tokens (sc, st, bpl, ...)
      - Strings with whitespace (multi-word queries)
      - Numbers
    Returns True for things like "asdfg", "qwertz", "zzzzzz".
    """
    if not text:
        return True
    s = text.strip()
    if not s:
        return True
    if _has_kannada(s):
        return False
    if " " in s:  # multi-word -> trust the user
        return False
    if s.lower() in _WHITELIST:
        return False
    if any(ch.isdigit() for ch in s):
        return False

    # Excessive character repetition (aaaaaa, !!!!!)
    if _REPEAT_RE.search(s):
        return True

    letters = _LATIN_RE.findall(s)
    if not letters:
        # purely punctuation/symbols
        return True

    # No vowel at all in a 4+ char "word" → almost certainly gibberish.
    if len(letters) >= 4 and not _LATIN_VOWEL_RE.search(s):
        return True

    return False


def is_meaningful_query(text: str) -> bool:
    """Public predicate the route handler should use."""
    if text is None:
        return False
    if not isinstance(text, str):
        return False
    s = text.strip()
    if not s:
        return False
    # Always allow Kannada
    if _has_kannada(s):
        return True
    # Always allow whitelisted short codes
    if s.lower() in _WHITELIST:
        return True
    # Reject obvious gibberish
    return not looks_like_gibberish(s)
