"""
Recommendation Pipeline (Main Orchestrator)
=============================================
Combines all ML pipeline modules into a single end-to-end pipeline:

    Input → NLP Parsing → Rule Filtering → Semantic Search
         → Scoring → Ranking → Explanation → JSON Output

This is the main entry point that the backend API calls to generate
scheme recommendations.

Usage:
    from ml_pipeline.recommendation_pipeline import RecommendationPipeline

    pipeline = RecommendationPipeline()
    pipeline.load_schemes(schemes_list)
    results = pipeline.recommend(user_input="I am a farmer from Rajasthan")
    results = pipeline.recommend(profile={"age": 30, "state": "Rajasthan"})
"""

import json
from typing import Dict, Any, List, Optional

from ml_pipeline.nlp_entity_extractor import NLPEntityExtractor
from ml_pipeline.rule_based_filter import RuleBasedFilter
from ml_pipeline.semantic_similarity_search import SemanticSimilaritySearch
from ml_pipeline.eligibility_score_calculator import EligibilityScoreCalculator
from ml_pipeline.scheme_ranker import SchemeRanker
from ml_pipeline.explainability_engine import ExplainabilityEngine
from ml_pipeline.eligibility_gap_analyzer import EligibilityGapAnalyzer


class RecommendationPipeline:
    """
    End-to-end recommendation pipeline orchestrator.

    Architecture:
    ┌─────────────────────────────────────────────────────────────────┐
    │                    RECOMMENDATION PIPELINE                      │
    │                                                                 │
    │  ┌───────────┐   ┌──────────┐   ┌───────────┐   ┌──────────┐ │
    │  │  NLP      │──▶│  Rule    │──▶│  Semantic  │──▶│  Score   │ │
    │  │  Extractor│   │  Filter  │   │  Search    │   │  Calc    │ │
    │  └───────────┘   └──────────┘   └───────────┘   └──────────┘ │
    │        │                                              │        │
    │        ▼                                              ▼        │
    │  ┌───────────┐                                 ┌──────────┐   │
    │  │  Profile   │                                │  Ranker   │  │
    │  │  (struct)  │                                │  (hybrid) │  │
    │  └───────────┘                                 └────┬─────┘  │
    │                                                      │        │
    │                    ┌──────────┐   ┌──────────┐      │        │
    │                    │  Explain │◀──│  Gap     │◀─────┘        │
    │                    │  Engine  │   │  Analyzer│               │
    │                    └────┬─────┘   └──────────┘               │
    │                         │                                     │
    │                         ▼                                     │
    │                   JSON OUTPUT                                 │
    └─────────────────────────────────────────────────────────────────┘

    Modes:
    - NLP Mode: User provides natural language text
    - Form Mode: User provides structured profile dictionary
    """

    def __init__(self, use_chromadb: bool = False):
        """
        Initialize all pipeline components.

        Args:
            use_chromadb: Whether to use ChromaDB for vector search.
                         Set to False for lightweight demo mode.
        """
        self.nlp_extractor = NLPEntityExtractor()
        self.rule_filter = RuleBasedFilter(max_violations=3)
        self.semantic_search = SemanticSimilaritySearch(use_chromadb=use_chromadb)
        self.score_calculator = EligibilityScoreCalculator()
        self.ranker = SchemeRanker()
        self.explainer = ExplainabilityEngine()
        self.gap_analyzer = EligibilityGapAnalyzer()

        self.schemes: List[Dict[str, Any]] = []
        self._indexed = False

    def load_schemes(self, schemes: List[Dict[str, Any]]) -> None:
        """
        Load scheme data into the pipeline and build search index.

        Args:
            schemes: List of scheme dictionaries from database.
        """
        self.schemes = schemes
        self.semantic_search.index_schemes(schemes)
        self._indexed = True
        print(f"✓ Pipeline loaded with {len(schemes)} schemes")

    def recommend(
        self,
        user_input: Optional[str] = None,
        profile: Optional[Dict[str, Any]] = None,
        top_k: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Run the full recommendation pipeline.

        Args:
            user_input: Natural language query (NLP mode).
            profile: Structured profile dict (Form mode).
            top_k: Maximum recommendations to return.

        Returns:
            List of recommendation dicts, each containing:
            - scheme_name, category, target_group, benefits, etc.
            - match_percentage (0-100)
            - eligibility_status ("eligible" | "partial" | "not_eligible")
            - missing_criteria (list of strings)
            - explanation (human-readable reason)
            - gap_analysis (improvement suggestions)
        """
        if not self._indexed:
            raise RuntimeError("Pipeline not initialized. Call load_schemes() first.")

        # ── Stage 1: NLP Entity Extraction ────────────────────────
        if user_input and not profile:
            profile = self.nlp_extractor.extract(user_input)
            print(f"[Stage 1] NLP extracted profile: {json.dumps(profile, default=str)}")
        elif not profile:
            profile = {}

        # ── Stage 2: Rule-Based Filtering ─────────────────────────
        rule_results = self.rule_filter.filter_schemes(profile, self.schemes)
        print(f"[Stage 2] Rule filter: {len(rule_results)}/{len(self.schemes)} schemes passed")

        # ── Stage 3: Semantic Similarity Search ───────────────────
        query_text = user_input or self._profile_to_query(profile)
        semantic_results = self.semantic_search.search(query_text, top_k=len(self.schemes))
        print(f"[Stage 3] Semantic search completed for {len(semantic_results)} schemes")

        # ── Stage 4: Eligibility Scoring ──────────────────────────
        scored_schemes = []
        for scheme_data in rule_results:
            score_result = self.score_calculator.calculate(profile, scheme_data)
            scored_schemes.append({
                **scheme_data,
                "score_result": score_result,
            })
        print(f"[Stage 4] Scored {len(scored_schemes)} schemes")

        # ── Stage 5: Hybrid Ranking ──────────────────────────────
        ranked = self.ranker.rank(rule_results, semantic_results, top_k=top_k)
        print(f"[Stage 5] Ranked top {len(ranked)} schemes")

        # ── Stage 6 & 7: Explanation + Gap Analysis ───────────────
        recommendations = []
        for ranked_scheme in ranked:
            scheme_id = str(ranked_scheme.get("id", ""))

            # Find matching score result
            score_result = None
            for ss in scored_schemes:
                if str(ss.get("id", "")) == scheme_id:
                    score_result = ss["score_result"]
                    break

            if not score_result:
                score_result = self.score_calculator.calculate(profile, ranked_scheme)

            # Generate explanation
            explanation = self.explainer.generate_explanation(ranked_scheme, score_result)

            # Gap analysis
            gap_analysis = self.gap_analyzer.analyze(profile, ranked_scheme, score_result)

            recommendations.append({
                "id": ranked_scheme.get("id"),
                "scheme_name": ranked_scheme.get("scheme_name"),
                "category": ranked_scheme.get("category"),
                "target_group": ranked_scheme.get("target_group"),
                "benefits": ranked_scheme.get("benefits"),
                "deadline": ranked_scheme.get("deadline"),
                "official_link": ranked_scheme.get("official_link"),
                "state": ranked_scheme.get("state"),
                "match_percentage": ranked_scheme.get("final_score", 0),
                "eligibility_status": score_result["status"],
                "missing_criteria": score_result["missing_criteria"],
                "explanation": explanation,
                "gap_analysis": {
                    "gaps": gap_analysis["gaps"],
                    "improvement_steps": gap_analysis["improvement_steps"],
                    "achievable": gap_analysis["achievable"],
                },
            })

        print(f"[Stage 6-7] Generated explanations and gap analysis")
        return recommendations

    def _profile_to_query(self, profile: Dict[str, Any]) -> str:
        """Convert a structured profile dict to a natural language query."""
        parts = []
        if profile.get("age"):
            parts.append(f"{profile['age']} year old")
        if profile.get("gender"):
            parts.append(profile["gender"].lower())
        if profile.get("occupation"):
            parts.append(profile["occupation"])
        if profile.get("state"):
            parts.append(f"from {profile['state']}")
        if profile.get("education_level"):
            parts.append(f"with {profile['education_level']} education")
        if profile.get("income"):
            parts.append(f"earning ₹{profile['income']:,}")
        if profile.get("goals"):
            parts.append(f"looking for {', '.join(profile['goals'])}")
        return " ".join(parts) if parts else "government scheme recommendation"

    def to_json(self, recommendations: List[Dict[str, Any]]) -> str:
        """Serialize recommendations to JSON string."""
        return json.dumps(recommendations, indent=2, default=str)


# ── Standalone Execution ──────────────────────────────────────────────

if __name__ == "__main__":
    # Load sample scheme data
    sample_schemes = [
        {
            "id": "1", "scheme_name": "PM Kisan Samman Nidhi",
            "category": "Agriculture", "target_group": "Farmers",
            "benefits": "₹6,000 per year direct benefit transfer",
            "income_limit": 200000, "min_age": 18, "max_age": 70,
            "gender": "All", "state": "All India",
            "education_level": None, "occupation": "farmer",
            "deadline": "2026-12-31", "official_link": "https://pmkisan.gov.in",
            "is_active": True, "description": "Income support for small farmers",
        },
        {
            "id": "2", "scheme_name": "Beti Bachao Beti Padhao",
            "category": "Women & Child Development", "target_group": "Girls",
            "benefits": "Education support and welfare for girl child",
            "income_limit": None, "min_age": 0, "max_age": 25,
            "gender": "Female", "state": "All India",
            "education_level": None, "occupation": None,
            "deadline": None, "official_link": "https://wcd.nic.in",
            "is_active": True, "description": "Girl child welfare and education",
        },
        {
            "id": "3", "scheme_name": "PM Awas Yojana",
            "category": "Housing", "target_group": "BPL Families",
            "benefits": "₹2.67 lakh housing subsidy",
            "income_limit": 300000, "min_age": 21, "max_age": 65,
            "gender": "All", "state": "All India",
            "education_level": None, "occupation": None,
            "deadline": "2026-06-30", "official_link": "https://pmaymis.gov.in",
            "is_active": True, "description": "Affordable housing for economically weaker sections",
        },
    ]

    # Initialize and run pipeline
    pipeline = RecommendationPipeline(use_chromadb=False)
    pipeline.load_schemes(sample_schemes)

    # NLP Mode
    print("\n" + "=" * 60)
    print("NLP MODE: Natural language input")
    print("=" * 60)
    results = pipeline.recommend(
        user_input="I am a 25 year old farmer from Rajasthan with income 1.5 lakh"
    )
    print(f"\nFound {len(results)} recommendations:\n")
    for r in results:
        print(f"  📋 {r['scheme_name']}")
        print(f"     Match: {r['match_percentage']}% | Status: {r['eligibility_status']}")
        print(f"     {r['explanation']}")
        if r['missing_criteria']:
            print(f"     Missing: {', '.join(r['missing_criteria'])}")
        print()

    # Form Mode
    print("=" * 60)
    print("FORM MODE: Structured profile input")
    print("=" * 60)
    results = pipeline.recommend(
        profile={"age": 10, "gender": "Female", "state": "Karnataka", "income": 100000}
    )
    print(f"\nFound {len(results)} recommendations:\n")
    print(pipeline.to_json(results[:2]))
