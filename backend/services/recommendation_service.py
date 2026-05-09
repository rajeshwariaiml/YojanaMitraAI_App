"""
Recommendation Service
======================
Bridges the FastAPI backend to the existing /ml_pipeline package.

The ML pipeline is NOT modified. This service:
  1. Detects Kannada in `query` / `profile` and translates to English
     BEFORE handing data to RecommendationPipeline.
  2. Loads the multilingual schemes dataset when available so Kannada
     titles can be returned in responses.
  3. Augments each recommendation with `title_kn` (when the original
     query was Kannada) so the frontend can show Kannada titles + alerts.
"""

from __future__ import annotations

import json
import os
import sys
from typing import Any, Dict, List, Optional

# Make the project root importable so `import ml_pipeline.*` works
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml_pipeline.recommendation_pipeline import RecommendationPipeline  # noqa: E402

from services.translation_service import (  # noqa: E402
    is_kannada,
    translate_kn_to_en,
    translate_profile,
    translate_to_kannada,
)

DATASET_MULTI = os.path.join(_PROJECT_ROOT, "dataset", "schemes_multilingual.json")
DATASET_PRIMARY = os.path.join(_PROJECT_ROOT, "dataset", "schemes.json")
DATASET_FALLBACK = os.path.join(_PROJECT_ROOT, "ml_pipeline", "dataset", "schemes_sample.json")

_pipeline: Optional[RecommendationPipeline] = None
_kn_lookup: Optional[Dict[str, Dict[str, Any]]] = None


def _load_schemes() -> List[Dict[str, Any]]:
    # Prefer the multilingual dataset so the pipeline + Kannada layer share data.
    for path in (DATASET_MULTI, DATASET_PRIMARY, DATASET_FALLBACK):
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
    return []


def _build_kn_lookup() -> Dict[str, Dict[str, Any]]:
    """Map English title -> full multilingual record for Kannada enrichment."""
    global _kn_lookup
    if _kn_lookup is None:
        _kn_lookup = {}
        if os.path.exists(DATASET_MULTI):
            with open(DATASET_MULTI, "r", encoding="utf-8") as f:
                for s in json.load(f):
                    name = (s.get("title_en") or s.get("scheme_name") or "").strip().lower()
                    if name:
                        _kn_lookup[name] = s
    return _kn_lookup


def _get_pipeline() -> RecommendationPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = RecommendationPipeline(use_chromadb=False)
        _pipeline.load_schemes(_load_schemes())
    return _pipeline


def _enrich_with_kannada(results: List[Dict[str, Any]], language: str = "en") -> List[Dict[str, Any]]:
    """Attach Kannada mirrors and localize visible response fields when requested."""
    lookup = _build_kn_lookup()
    enriched = []
    for r in results:
        name = (r.get("scheme_name") or r.get("title") or r.get("title_en") or "").strip().lower()
        extra = lookup.get(name, {}) if lookup else {}
        merged = {**r}
        field_pairs = {
            "scheme_name_kn": ("scheme_name", "title_en"),
            "title_kn": ("scheme_name", "title_en"),
            "description_kn": ("description", "description_en"),
            "benefits_kn": ("benefits", "benefits_en"),
            "eligibility_kn": ("eligibility", "eligibility_en", "target_group"),
            "category_kn": ("category", "category_en"),
            "target_group_kn": ("target_group", "target_group_en"),
            "state_kn": ("state", "state_en"),
            "explanation_kn": ("explanation", "explanation_en"),
        }
        for kn_field, sources in field_pairs.items():
            if extra.get(kn_field):
                merged[kn_field] = extra[kn_field]
                continue
            for src in sources:
                val = merged.get(src) or extra.get(src)
                if isinstance(val, str) and val.strip():
                    merged[kn_field] = translate_to_kannada(val)
                    break
        if language == "kn":
            visible = {
                "scheme_name": "scheme_name_kn",
                "title": "title_kn",
                "description": "description_kn",
                "benefits": "benefits_kn",
                "eligibility": "eligibility_kn",
                "category": "category_kn",
                "target_group": "target_group_kn",
                "state": "state_kn",
                "explanation": "explanation_kn",
            }
            for field, kn_field in visible.items():
                if merged.get(kn_field):
                    merged[field] = merged[kn_field]
            merged["display_language"] = "kn"
            merged["missing_criteria"] = [translate_to_kannada(x) if isinstance(x, str) else x for x in merged.get("missing_criteria", [])]
        enriched.append(merged)
    return enriched


def recommend(
    query: Optional[str] = None,
    profile: Optional[Dict[str, Any]] = None,
    top_k: int = 10,
    language: str = "en",
) -> List[Dict[str, Any]]:
    pipeline = _get_pipeline()

    kannada_input = is_kannada(query) or any(
        is_kannada(profile.get(f)) for f in ("occupation", "category")
    ) if profile else is_kannada(query)

    en_query = translate_kn_to_en(query) if is_kannada(query) else query
    en_profile, _ = translate_profile(profile) if profile else (profile, {})

    results = pipeline.recommend(user_input=en_query, profile=en_profile, top_k=top_k)
    enriched = _enrich_with_kannada(results, "kn" if language == "kn" or kannada_input else "en")
    return enriched
