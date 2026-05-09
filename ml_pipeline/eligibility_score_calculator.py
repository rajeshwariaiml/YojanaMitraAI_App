"""
Eligibility Score Calculator Module
=====================================
Calculates a weighted eligibility score (0-100%) for each user-scheme
pair based on matched demographic attributes and penalizes for
missing criteria.

Pipeline Stage: 4 (Scoring)

Scoring Strategy:
  Each eligibility dimension is assigned a weight reflecting its
  importance in government scheme eligibility determination.
  The final score is the weighted sum of matched dimensions.
"""

from typing import Dict, Any, List, Tuple


# ── Attribute Weights ─────────────────────────────────────────────────
# Weights reflect importance in typical government scheme eligibility.
# Total weights sum to 100 for direct percentage interpretation.

ATTRIBUTE_WEIGHTS = {
    "age": 20,
    "income": 20,
    "state": 15,
    "gender": 10,
    "education": 15,
    "occupation": 10,
    "category": 10,
}


class EligibilityScoreCalculator:
    """
    Computes eligibility scores using weighted attribute matching.

    Pipeline Stage: 4

    Score Interpretation:
    - 80-100%: Highly eligible — strong match across most criteria
    - 60-79%:  Partially eligible — some criteria may be missing
    - 40-59%:  Low eligibility — significant gaps exist
    - 0-39%:   Not eligible — major disqualifying factors

    Scoring Formula:
        score = Σ (weight_i × match_i) / Σ weight_i × 100

    Where match_i ∈ {0, 0.5, 1}:
        1.0 = full match
        0.5 = partial match (e.g., attribute not specified)
        0.0 = mismatch
    """

    def __init__(self, weights: Dict[str, int] = None):
        self.weights = weights or ATTRIBUTE_WEIGHTS

    def calculate(
        self, user_profile: Dict[str, Any], scheme: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate eligibility score for a user-scheme pair.

        Args:
            user_profile: Extracted user demographic profile.
            scheme: Scheme dictionary with eligibility fields.

        Returns:
            Dictionary with:
            - score: float (0-100)
            - status: "eligible" | "partial" | "not_eligible"
            - matched_attributes: list of matched dimension names
            - missing_criteria: list of human-readable missing criteria
            - attribute_scores: per-attribute breakdown
        """
        attribute_scores = {}
        matched = []
        missing = []

        # ── Age ───────────────────────────────────────────────────
        age_result = self._score_age(user_profile, scheme)
        attribute_scores["age"] = age_result
        if age_result["match"] == 1.0:
            matched.append("age")
        elif age_result["match"] == 0.0:
            missing.append(age_result["reason"])

        # ── Income ────────────────────────────────────────────────
        income_result = self._score_income(user_profile, scheme)
        attribute_scores["income"] = income_result
        if income_result["match"] == 1.0:
            matched.append("income")
        elif income_result["match"] == 0.0:
            missing.append(income_result["reason"])

        # ── State ─────────────────────────────────────────────────
        state_result = self._score_state(user_profile, scheme)
        attribute_scores["state"] = state_result
        if state_result["match"] >= 0.5:
            matched.append("state")
        elif state_result["match"] == 0.0:
            missing.append(state_result["reason"])

        # ── Gender ────────────────────────────────────────────────
        gender_result = self._score_gender(user_profile, scheme)
        attribute_scores["gender"] = gender_result
        if gender_result["match"] >= 0.5:
            matched.append("gender")
        elif gender_result["match"] == 0.0:
            missing.append(gender_result["reason"])

        # ── Education ─────────────────────────────────────────────
        edu_result = self._score_education(user_profile, scheme)
        attribute_scores["education"] = edu_result
        if edu_result["match"] >= 0.5:
            matched.append("education")
        elif edu_result["match"] == 0.0:
            missing.append(edu_result["reason"])

        # ── Occupation ────────────────────────────────────────────
        occ_result = self._score_occupation(user_profile, scheme)
        attribute_scores["occupation"] = occ_result
        if occ_result["match"] >= 0.5:
            matched.append("occupation")
        elif occ_result["match"] == 0.0:
            missing.append(occ_result["reason"])

        # ── Category ──────────────────────────────────────────────
        cat_result = self._score_category(user_profile, scheme)
        attribute_scores["category"] = cat_result
        if cat_result["match"] >= 0.5:
            matched.append("category")
        elif cat_result["match"] == 0.0:
            missing.append(cat_result["reason"])

        # ── Compute Weighted Score ────────────────────────────────
        total_weight = sum(self.weights.values())
        weighted_sum = sum(
            self.weights[attr] * attribute_scores[attr]["match"]
            for attr in self.weights
        )
        score = round((weighted_sum / total_weight) * 100, 1)
        score = min(score, 98)  # Cap at 98 — only manual verification = 100

        # Determine status
        if score >= 70:
            status = "eligible"
        elif score >= 40:
            status = "partial"
        else:
            status = "not_eligible"

        return {
            "score": score,
            "status": status,
            "matched_attributes": matched,
            "missing_criteria": missing,
            "attribute_scores": attribute_scores,
        }

    # ── Individual Attribute Scoring Methods ──────────────────────────

    def _score_age(self, profile, scheme) -> Dict:
        age = profile.get("age")
        min_age = scheme.get("min_age", 0) or 0
        max_age = scheme.get("max_age", 100) or 100
        if age is None:
            return {"match": 0.5, "reason": "Age not provided"}
        if min_age <= age <= max_age:
            return {"match": 1.0, "reason": "Age eligible"}
        return {"match": 0.0, "reason": f"Age must be {min_age}-{max_age}"}

    def _score_income(self, profile, scheme) -> Dict:
        income = profile.get("income")
        limit = scheme.get("income_limit")
        if limit is None:
            return {"match": 1.0, "reason": "No income restriction"}
        if income is None:
            return {"match": 0.5, "reason": "Income not provided"}
        if income <= limit:
            return {"match": 1.0, "reason": "Income eligible"}
        return {"match": 0.0, "reason": f"Income must be under ₹{limit:,}"}

    def _score_state(self, profile, scheme) -> Dict:
        scheme_state = scheme.get("state", "All India") or "All India"
        if scheme_state == "All India":
            return {"match": 1.0, "reason": "Available nationwide"}
        user_state = profile.get("state")
        if user_state is None:
            return {"match": 0.5, "reason": "State not provided"}
        if user_state == scheme_state:
            return {"match": 1.0, "reason": "State matches"}
        return {"match": 0.0, "reason": f"Must be from {scheme_state}"}

    def _score_gender(self, profile, scheme) -> Dict:
        scheme_gender = scheme.get("gender", "All") or "All"
        if scheme_gender == "All":
            return {"match": 1.0, "reason": "Open to all genders"}
        user_gender = profile.get("gender")
        if user_gender is None:
            return {"match": 0.5, "reason": "Gender not provided"}
        if user_gender == scheme_gender:
            return {"match": 1.0, "reason": "Gender matches"}
        return {"match": 0.0, "reason": f"{scheme_gender} applicants only"}

    def _score_education(self, profile, scheme) -> Dict:
        scheme_edu = scheme.get("education_level")
        if scheme_edu is None:
            return {"match": 1.0, "reason": "No education restriction"}
        user_edu = profile.get("education_level")
        if user_edu is None:
            return {"match": 0.5, "reason": "Education not provided"}
        if user_edu == scheme_edu:
            return {"match": 1.0, "reason": "Education matches"}
        return {"match": 0.0, "reason": f"Requires {scheme_edu}"}

    def _score_occupation(self, profile, scheme) -> Dict:
        scheme_occ = scheme.get("occupation")
        if scheme_occ is None:
            return {"match": 1.0, "reason": "No occupation restriction"}
        user_occ = profile.get("occupation")
        if user_occ is None:
            return {"match": 0.5, "reason": "Occupation not provided"}
        if user_occ.lower() == scheme_occ.lower():
            return {"match": 1.0, "reason": "Occupation matches"}
        return {"match": 0.0, "reason": f"Requires {scheme_occ}"}

    def _score_category(self, profile, scheme) -> Dict:
        target = scheme.get("target_group", "All") or "All"
        if target == "All":
            return {"match": 1.0, "reason": "Open to all categories"}
        user_cat = profile.get("category")
        if user_cat is None:
            return {"match": 0.5, "reason": "Category not provided"}
        if user_cat.lower() in target.lower():
            return {"match": 1.0, "reason": "Category matches"}
        return {"match": 0.0, "reason": f"Target group: {target}"}


# ── Standalone Usage ──────────────────────────────────────────────────

if __name__ == "__main__":
    calculator = EligibilityScoreCalculator()

    profile = {
        "age": 22, "gender": "Female", "income": 150000,
        "occupation": "student", "education_level": "Graduate",
        "state": "Karnataka", "category": "General",
    }
    scheme = {
        "scheme_name": "National Scholarship Portal",
        "min_age": 18, "max_age": 30, "income_limit": 200000,
        "gender": "All", "state": "All India",
        "education_level": "Graduate", "occupation": None,
        "target_group": "All",
    }

    result = calculator.calculate(profile, scheme)
    print(f"Score: {result['score']}%")
    print(f"Status: {result['status']}")
    print(f"Matched: {result['matched_attributes']}")
    print(f"Missing: {result['missing_criteria']}")
