"""
User Model
==========
Pydantic schemas for auth + profile + recommend request/response payloads.
No ORM — persistence is JSON files in backend/database/.

Strictness notes (Part 3):
- All recommend-request fields are Optional with sensible defaults so
  malformed JSON yields a clean 422 instead of a 500.
- top_k is bounded to keep the pipeline cheap.
- mode is a Literal so unknown values fail validation cleanly.
"""

from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ── Auth ─────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None


# ── Profile ──────────────────────────────────────────────────────────

class ProfileModel(BaseModel):
    """Tolerant profile model — most fields optional for demo seeds."""
    model_config = ConfigDict(extra="allow")

    email: Optional[EmailStr] = None
    name: Optional[str] = Field(None, max_length=100)
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = Field(None, max_length=32)
    income: Optional[float] = Field(None, ge=0)
    occupation: Optional[str] = Field(None, max_length=64)
    education_level: Optional[str] = Field(None, max_length=64)
    state: Optional[str] = Field(None, max_length=64)
    category: Optional[str] = Field(None, max_length=64)
    language: Optional[Literal["en", "kn"]] = "en"


# ── Recommendations ──────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    """Body for POST /recommend-schemes.

    Either `query` or `profile` (or both) should be present. The route
    handler enforces business rules (e.g. gibberish guard) — Pydantic
    only enforces *shape*.
    """
    model_config = ConfigDict(extra="ignore")

    query: Optional[str] = Field(None, max_length=500)
    profile: Optional[Dict[str, Any]] = None
    mode: Literal["nlp", "form", "hybrid"] = "hybrid"
    top_k: int = Field(10, ge=1, le=50)
    language: Optional[Literal["en", "kn"]] = "en"


class SchemeOut(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: Optional[str] = None
    scheme_name: Optional[str] = None
    title: Optional[str] = None
    title_kn: Optional[str] = None
    description_kn: Optional[str] = None
    benefits_kn: Optional[str] = None
    eligibility_kn: Optional[str] = None
    category_kn: Optional[str] = None
    target_group_kn: Optional[str] = None
    keywords_kn: Optional[List[str]] = None
    match_percentage: Optional[float] = 0
    eligibility_status: Optional[Literal["eligible", "partial", "not_eligible"]] = "partial"


class RecommendResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    count: int
    mode: str
