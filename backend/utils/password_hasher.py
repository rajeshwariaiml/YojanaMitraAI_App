"""
Password Hasher
===============
Lightweight PBKDF2-SHA256 hasher (stdlib only — no bcrypt dependency
required for the academic demo). Produces salted hashes of the form:

    pbkdf2_sha256$<iterations>$<salt_hex>$<hash_hex>

This avoids storing plaintext passwords inside backend/database/users.json
while keeping the backend installable with just `fastapi` + `uvicorn`.
"""

from __future__ import annotations

import hashlib
import hmac
import os

_ALGO = "pbkdf2_sha256"
_ITERATIONS = 120_000
_SALT_BYTES = 16


def hash_password(password: str) -> str:
    if not isinstance(password, str) or not password:
        raise ValueError("password must be a non-empty string")
    salt = os.urandom(_SALT_BYTES)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, _ITERATIONS)
    return f"{_ALGO}${_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iter_str, salt_hex, hash_hex = stored.split("$")
        if algo != _ALGO:
            return False
        iterations = int(iter_str)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(hash_hex)
    except (ValueError, AttributeError):
        return False
    candidate = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(candidate, expected)
