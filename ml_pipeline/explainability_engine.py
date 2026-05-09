"""
Explainability Engine Module
==============================
Generates human-readable explanations for why each scheme
was recommended to the user. Implements Explainable AI (XAI)
principles for transparent recommendation reasoning.

Pipeline Stage: 6 (Explanation Generation)

Approach:
  Feature-attribution explainability — each matched/missing attribute
  is cited in the explanation with its contribution to the score.
"""

from typing import Dict, Any, List


class ExplainabilityEngine:
    """
    Produces natural language explanations for scheme recommendations.

    Pipeline Stage: 6

    Explanation Structure:
    1. Opening statement with match level
    2. Matched criteria justification
    3. Missing criteria acknowledgment
    4. Actionable advice for partial matches
    """

    # Templates for different match levels
    TEMPLATES = {
        "eligible": (
            "This scheme is highly recommended for you. "
            "{matched_text} "
            "Your profile strongly aligns with the eligibility criteria."
        ),
        "partial": (
            "This scheme is a partial match for your profile. "
            "{matched_text} "
            "However, {missing_text} "
            "Consider updating your profile or checking if exceptions apply."
        ),
        "not_eligible": (
            "This scheme has limited alignment with your current profile. "
            "{matched_text} "
            "{missing_text} "
            "You may become eligible if your circumstances change."
        ),
    }

    ATTRIBUTE_NAMES = {
        "age": "age range",
        "income": "income level",
        "state": "geographic location",
        "gender": "gender criteria",
        "education": "education qualification",
        "occupation": "occupation type",
        "category": "social category",
    }

    def generate_explanation(
        self,
        scheme: Dict[str, Any],
        score_result: Dict[str, Any],
    ) -> str:
        """
        Generate a natural language explanation for a recommendation.

        Args:
            scheme: Scheme dictionary with name and details.
            score_result: Output from EligibilityScoreCalculator containing
                         score, status, matched_attributes, missing_criteria,
                         and attribute_scores.

        Returns:
            Human-readable explanation string.
        """
        status = score_result.get("status", "partial")
        matched = score_result.get("matched_attributes", [])
        missing = score_result.get("missing_criteria", [])
        score = score_result.get("score", 0)

        # Build matched text
        if matched:
            attr_names = [self.ATTRIBUTE_NAMES.get(a, a) for a in matched]
            if len(attr_names) == 1:
                matched_text = f"It matches your {attr_names[0]}."
            else:
                matched_text = (
                    f"It matches your {', '.join(attr_names[:-1])}"
                    f" and {attr_names[-1]}."
                )
        else:
            matched_text = "Limited profile information was available for matching."

        # Build missing text
        if missing:
            missing_text = "Missing criteria: " + "; ".join(missing) + "."
        else:
            missing_text = ""

        # Select template and format
        template = self.TEMPLATES.get(status, self.TEMPLATES["partial"])
        explanation = template.format(
            matched_text=matched_text,
            missing_text=missing_text,
        ).strip()

        return explanation

    def generate_batch_explanations(
        self,
        recommendations: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Generate explanations for a batch of recommendations.

        Args:
            recommendations: List of recommendation dicts, each containing
                           'scheme' and 'score_result' keys.

        Returns:
            Same list with 'explanation' field added to each entry.
        """
        for rec in recommendations:
            rec["explanation"] = self.generate_explanation(
                rec.get("scheme", {}),
                rec.get("score_result", {}),
            )
        return recommendations


# ── Standalone Usage ──────────────────────────────────────────────────

if __name__ == "__main__":
    engine = ExplainabilityEngine()

    scheme = {"scheme_name": "PM Kisan Samman Nidhi"}
    score_result = {
        "score": 75,
        "status": "eligible",
        "matched_attributes": ["age", "income", "state", "occupation"],
        "missing_criteria": [],
    }

    explanation = engine.generate_explanation(scheme, score_result)
    print(f"Scheme: {scheme['scheme_name']}")
    print(f"Explanation: {explanation}")

    print("\n--- Partial Match ---")
    score_result2 = {
        "score": 55,
        "status": "partial",
        "matched_attributes": ["age", "state"],
        "missing_criteria": ["Income must be under ₹2,00,000", "Female applicants only"],
    }
    print(engine.generate_explanation(scheme, score_result2))
