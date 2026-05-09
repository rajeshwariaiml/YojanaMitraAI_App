"""
Recommend Controller
====================
Thin wrapper around services/recommendation_service.py so the route
file stays minimal.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from services.recommendation_service import recommend


def recommend_schemes(
    query: Optional[str],
    profile: Optional[Dict[str, Any]],
    mode: str,
    top_k: int,
    language: str = "en",
) -> Dict[str, Any]:
    # mode is accepted for parity with the existing Edge Function contract;
    # the underlying pipeline handles either query or profile transparently.
    effective_query = query if mode == "nlp" else None
    effective_profile = profile if mode != "nlp" or profile else profile
    results: List[Dict[str, Any]] = recommend(
        query=effective_query,
        profile=effective_profile,
        top_k=top_k,
        language=language,
    )
    return {"recommendations": results, "count": len(results), "mode": mode}
