"""
Scheme Ranker Module
=====================
Ranks recommended schemes using a hybrid scoring approach that
combines rule-based eligibility scores with semantic similarity scores.

Pipeline Stage: 5 (Ranking)

Hybrid Scoring Formula:
    final_score = α × rule_score + β × semantic_score + γ × bonus

Where:
    α = 0.6  (rule-based weight — eligibility is primary)
    β = 0.3  (semantic weight — intent relevance)
    γ = 0.1  (bonus factors — deadlines, popularity)
"""

from typing import Dict, Any, List
from datetime import datetime, date


# ── Ranking Weights ───────────────────────────────────────────────────

ALPHA = 0.6   # Rule-based eligibility weight
BETA = 0.3    # Semantic similarity weight
GAMMA = 0.1   # Bonus factor weight


class SchemeRanker:
    """
    Produces a final ranked list of scheme recommendations using
    hybrid scoring that merges rule-based and semantic signals.

    Pipeline Stage: 5

    Ranking Process:
    1. Normalize rule scores and semantic scores to [0, 1]
    2. Compute bonus score from contextual factors
    3. Combine using weighted formula
    4. Sort descending by final score
    5. Return top-k results
    """

    def __init__(
        self,
        alpha: float = ALPHA,
        beta: float = BETA,
        gamma: float = GAMMA,
    ):
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma

    def rank(
        self,
        rule_results: List[Dict[str, Any]],
        semantic_results: List[Dict[str, Any]],
        top_k: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Rank schemes by combining rule-based and semantic scores.

        Args:
            rule_results: Output from RuleBasedFilter, each containing
                         'id', 'rule_score', 'matched_rules', 'violated_rules'.
            semantic_results: Output from SemanticSimilaritySearch, each
                             containing 'scheme_id', 'similarity_score'.
            top_k: Maximum number of results to return.

        Returns:
            Ranked list of scheme dicts with final_score and component scores.
        """
        # Build lookup for semantic scores
        semantic_lookup = {
            r["scheme_id"]: r["similarity_score"]
            for r in semantic_results
        }

        ranked = []
        for scheme in rule_results:
            scheme_id = str(scheme.get("id", ""))
            rule_score = scheme.get("rule_score", 0) / 100.0  # Normalize to [0,1]
            sem_score = semantic_lookup.get(scheme_id, 0.0)
            bonus = self._compute_bonus(scheme)

            final_score = (
                self.alpha * rule_score
                + self.beta * sem_score
                + self.gamma * bonus
            )

            # Convert to percentage and cap
            final_pct = round(min(final_score * 100, 98), 1)

            ranked.append({
                **scheme,
                "final_score": final_pct,
                "rule_component": round(rule_score * 100, 1),
                "semantic_component": round(sem_score * 100, 1),
                "bonus_component": round(bonus * 100, 1),
            })

        # Sort by final score descending
        ranked.sort(key=lambda x: x["final_score"], reverse=True)
        return ranked[:top_k]

    def _compute_bonus(self, scheme: Dict[str, Any]) -> float:
        """
        Compute bonus score from contextual factors.

        Factors:
        - Deadline proximity: schemes expiring soon get urgency boost
        - Scheme activity: active schemes get a base bonus
        """
        bonus = 0.0

        # Active scheme base bonus
        if scheme.get("is_active", True):
            bonus += 0.3

        # Deadline urgency bonus
        deadline = scheme.get("deadline")
        if deadline:
            try:
                if isinstance(deadline, str):
                    deadline_date = datetime.strptime(deadline, "%Y-%m-%d").date()
                else:
                    deadline_date = deadline

                days_left = (deadline_date - date.today()).days
                if 0 < days_left <= 30:
                    bonus += 0.7  # Urgent — expiring within a month
                elif 0 < days_left <= 90:
                    bonus += 0.4  # Approaching deadline
                elif days_left > 90:
                    bonus += 0.1  # Plenty of time
            except (ValueError, TypeError):
                pass

        return min(bonus, 1.0)


# ── Standalone Usage ──────────────────────────────────────────────────

if __name__ == "__main__":
    ranker = SchemeRanker()

    rule_results = [
        {"id": "1", "scheme_name": "PM Kisan", "rule_score": 85,
         "matched_rules": ["age", "income", "state"], "violated_rules": [],
         "is_active": True, "deadline": "2026-12-31"},
        {"id": "2", "scheme_name": "Scholarship X", "rule_score": 60,
         "matched_rules": ["age", "education"], "violated_rules": ["income"],
         "is_active": True, "deadline": "2026-05-01"},
    ]

    semantic_results = [
        {"scheme_id": "1", "similarity_score": 0.72},
        {"scheme_id": "2", "similarity_score": 0.88},
    ]

    ranked = ranker.rank(rule_results, semantic_results)
    for r in ranked:
        print(f"{r['scheme_name']}: final={r['final_score']}% "
              f"(rule={r['rule_component']}%, sem={r['semantic_component']}%, "
              f"bonus={r['bonus_component']}%)")
