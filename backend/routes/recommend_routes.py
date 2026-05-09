"""
Recommend Routes
================
POST /recommend-schemes

Body:
    {
      "query": "...",
      "profile": { ... },
      "mode": "nlp" | "form" | "hybrid",
      "top_k": 10,
      "language": "en" | "kn"
    }

Adds (Part 3):
- 422 on malformed JSON  (handled by FastAPI/Pydantic via RecommendRequest).
- 400 on gibberish queries   (input_validation.is_meaningful_query).
- KN backfill for any missing `*_kn` fields in the response so the
  frontend's strict renderer never has to fall back to English.
"""

from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, status

from controllers.recommend_controller import recommend_schemes
from models.user_model import RecommendRequest
from utils.input_validation import is_meaningful_query
from services.translation_service import translate_to_kannada, is_kannada

router = APIRouter(tags=["recommend"])


_KN_FIELDS_FROM_EN = {
    "title_kn":          ("title", "title_en", "scheme_name"),
    "description_kn":    ("description", "description_en"),
    "benefits_kn":       ("benefits", "benefits_en"),
    "eligibility_kn":    ("eligibility", "eligibility_en"),
    "category_kn":       ("category", "category_en"),
    "target_group_kn":   ("target_group", "target_group_en"),
    "explanation_kn":    ("explanation", "explanation_en"),
}


def _backfill_kn(scheme: Dict[str, Any]) -> Dict[str, Any]:
    out = dict(scheme)
    for kn_field, en_sources in _KN_FIELDS_FROM_EN.items():
        existing = out.get(kn_field)
        if isinstance(existing, str) and existing.strip() and is_kannada(existing):
            continue
        for src in en_sources:
            val = out.get(src)
            if isinstance(val, str) and val.strip():
                out[kn_field] = translate_to_kannada(val)
                break

    # List fields
    for list_field, en_src in (
        ("keywords_kn", "keywords"),
        ("tags_kn", "tags"),
        ("beneficiary_labels_kn", "beneficiary_labels"),
    ):
        if list_field in out and isinstance(out[list_field], list) and out[list_field]:
            continue
        src_val = out.get(en_src) or out.get(f"{en_src}_en")
        if isinstance(src_val, list):
            out[list_field] = [translate_to_kannada(s) if isinstance(s, str) else s
                               for s in src_val]
    return out


@router.post("/recommend-schemes")
def recommend(payload: RecommendRequest):
    # Gibberish / empty-query guard. We only reject when a query is supplied
    # AND no profile is given — a profile-only request is always valid.
    if payload.query is not None and not payload.profile:
        if not is_meaningful_query(payload.query):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "invalid_query",
                    "message": "Query appears to be empty or invalid. "
                               "Try a keyword like 'scholarship', 'SC', 'BPL', or describe your need.",
                },
            )

    try:
        result = recommend_schemes(
            query=payload.query,
            profile=payload.profile,
            mode=payload.mode,
            top_k=payload.top_k,
            language=payload.language or "en",
        )
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "pipeline_failure", "message": str(exc)},
        )

    # Backfill Kannada fields for the strict frontend renderer.
    recs: List[Dict[str, Any]] = result.get("recommendations", []) or []
    result["recommendations"] = [_backfill_kn(s) if isinstance(s, dict) else s
                                  for s in recs]
    return result
