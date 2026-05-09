"""
Auth Controller
===============
Handles signup + login against backend/database/users.json.
Plain JSON persistence keeps everything visible for academic review.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import HTTPException

from utils.password_hasher import hash_password, verify_password

USERS_FILE = os.path.join(os.path.dirname(__file__), "..", "database", "users.json")
USERS_FILE = os.path.abspath(USERS_FILE)


def _load_users() -> List[Dict[str, Any]]:
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def _save_users(users: List[Dict[str, Any]]) -> None:
    os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)


def signup(name: str, email: str, password: str) -> Dict[str, Any]:
    email_norm = email.strip().lower()
    users = _load_users()
    if any(u.get("email", "").lower() == email_norm for u in users):
        raise HTTPException(status_code=409, detail="Account with this email already exists")

    record = {
        "name": name.strip(),
        "email": email_norm,
        "password_hash": hash_password(password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    users.append(record)
    _save_users(users)

    return {
        "success": True,
        "message": "Account created successfully",
        "user": {"name": record["name"], "email": record["email"]},
    }


def login(email: str, password: str) -> Dict[str, Any]:
    email_norm = email.strip().lower()
    users = _load_users()
    user = next((u for u in users if u.get("email", "").lower() == email_norm), None)
    if not user or not verify_password(password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "success": True,
        "message": "Login successful",
        "user": {"name": user.get("name"), "email": user["email"]},
    }
