"""
Eligibility Gap Analyzer Module
=================================
Identifies specific gaps between a user's profile and scheme
requirements, then suggests actionable steps to close those gaps
and become eligible.

Pipeline Stage: 7 (Gap Analysis)

This module enhances user experience by providing forward-looking
advice rather than just rejection messages.
"""

from typing import Dict, Any, List


# ── Improvement Suggestions Database ──────────────────────────────────

IMPROVEMENT_STEPS = {
    "age": {
        "too_young": "This scheme requires a minimum age of {min_age}. "
                     "You will become eligible in {years_until} years.",
        "too_old": "This scheme has a maximum age limit of {max_age}. "
                   "Consider alternative schemes for your age group.",
    },
    "income": {
        "too_high": "Your income exceeds the limit of ₹{limit:,}. "
                    "Check if your household income (not individual) "
                    "qualifies, or look for schemes with higher limits.",
    },
    "state": {
        "mismatch": "This scheme is only available in {required_state}. "
                    "Look for similar Central Government schemes available nationwide, "
                    "or check your state's equivalent program.",
    },
    "gender": {
        "mismatch": "This scheme is restricted to {required_gender} applicants. "
                    "Search for similar schemes open to all genders.",
    },
    "education": {
        "mismatch": "This scheme requires {required_edu} education level. "
                    "Consider upskilling through government skill development "
                    "programs like PMKVY (Pradhan Mantri Kaushal Vikas Yojana).",
    },
    "occupation": {
        "mismatch": "This scheme targets {required_occ} professionals. "
                    "Check if your current occupation qualifies under "
                    "a related category.",
    },
    "category": {
        "mismatch": "This scheme targets {required_group}. "
                    "Verify your category certificate status and check "
                    "for schemes targeting your specific demographic.",
    },
}


class EligibilityGapAnalyzer:
    """
    Analyzes eligibility gaps and provides improvement roadmaps.

    Pipeline Stage: 7

    Output:
    - List of specific gaps with severity levels
    - Actionable improvement suggestions for each gap
    - Overall gap summary with eligibility percentage
    - Prioritized steps to maximize eligibility
    """

    def analyze(
        self,
        user_profile: Dict[str, Any],
        scheme: Dict[str, Any],
        score_result: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Perform gap analysis between user profile and scheme requirements.

        Args:
            user_profile: User's demographic profile.
            scheme: Scheme dictionary with eligibility fields.
            score_result: Output from EligibilityScoreCalculator.

        Returns:
            Dictionary containing:
            - gaps: list of gap details with severity and suggestions
            - gap_count: number of gaps found
            - eligibility_percentage: current match percentage
            - improvement_steps: prioritized list of actions
            - achievable: whether eligibility is realistically achievable
        """
        gaps = []
        improvement_steps = []

        # ── Analyze each attribute ────────────────────────────────
        attr_scores = score_result.get("attribute_scores", {})

        # Age gap
        if attr_scores.get("age", {}).get("match", 1) == 0:
            gap = self._analyze_age_gap(user_profile, scheme)
            if gap:
                gaps.append(gap)
                improvement_steps.append(gap["suggestion"])

        # Income gap
        if attr_scores.get("income", {}).get("match", 1) == 0:
            gap = self._analyze_income_gap(user_profile, scheme)
            if gap:
                gaps.append(gap)
                improvement_steps.append(gap["suggestion"])

        # State gap
        if attr_scores.get("state", {}).get("match", 1) == 0:
            gap = self._analyze_state_gap(user_profile, scheme)
            if gap:
                gaps.append(gap)
                improvement_steps.append(gap["suggestion"])

        # Gender gap
        if attr_scores.get("gender", {}).get("match", 1) == 0:
            gap = self._analyze_gender_gap(scheme)
            if gap:
                gaps.append(gap)
                improvement_steps.append(gap["suggestion"])

        # Education gap
        if attr_scores.get("education", {}).get("match", 1) == 0:
            gap = self._analyze_education_gap(scheme)
            if gap:
                gaps.append(gap)
                improvement_steps.append(gap["suggestion"])

        # Occupation gap
        if attr_scores.get("occupation", {}).get("match", 1) == 0:
            gap = self._analyze_occupation_gap(scheme)
            if gap:
                gaps.append(gap)
                improvement_steps.append(gap["suggestion"])

        # Category gap
        if attr_scores.get("category", {}).get("match", 1) == 0:
            gap = self._analyze_category_gap(scheme)
            if gap:
                gaps.append(gap)
                improvement_steps.append(gap["suggestion"])

        # Determine if eligibility is achievable
        immutable_gaps = [g for g in gaps if g["severity"] == "immutable"]
        achievable = len(immutable_gaps) == 0

        return {
            "gaps": gaps,
            "gap_count": len(gaps),
            "eligibility_percentage": score_result.get("score", 0),
            "improvement_steps": improvement_steps,
            "achievable": achievable,
            "summary": self._generate_summary(gaps, score_result, achievable),
        }

    # ── Individual Gap Analyzers ──────────────────────────────────────

    def _analyze_age_gap(self, profile, scheme) -> Dict:
        age = profile.get("age", 0)
        min_age = scheme.get("min_age", 0) or 0
        max_age = scheme.get("max_age", 100) or 100

        if age < min_age:
            return {
                "attribute": "age",
                "severity": "temporary",
                "current": age,
                "required": f"{min_age}-{max_age}",
                "suggestion": IMPROVEMENT_STEPS["age"]["too_young"].format(
                    min_age=min_age, years_until=min_age - age
                ),
            }
        else:
            return {
                "attribute": "age",
                "severity": "immutable",
                "current": age,
                "required": f"{min_age}-{max_age}",
                "suggestion": IMPROVEMENT_STEPS["age"]["too_old"].format(max_age=max_age),
            }

    def _analyze_income_gap(self, profile, scheme) -> Dict:
        income = profile.get("income", 0)
        limit = scheme.get("income_limit", 0)
        return {
            "attribute": "income",
            "severity": "changeable",
            "current": f"₹{income:,}",
            "required": f"≤ ₹{limit:,}",
            "suggestion": IMPROVEMENT_STEPS["income"]["too_high"].format(limit=limit),
        }

    def _analyze_state_gap(self, profile, scheme) -> Dict:
        return {
            "attribute": "state",
            "severity": "changeable",
            "current": profile.get("state", "Unknown"),
            "required": scheme.get("state", ""),
            "suggestion": IMPROVEMENT_STEPS["state"]["mismatch"].format(
                required_state=scheme.get("state", "")
            ),
        }

    def _analyze_gender_gap(self, scheme) -> Dict:
        return {
            "attribute": "gender",
            "severity": "immutable",
            "current": "N/A",
            "required": scheme.get("gender", ""),
            "suggestion": IMPROVEMENT_STEPS["gender"]["mismatch"].format(
                required_gender=scheme.get("gender", "")
            ),
        }

    def _analyze_education_gap(self, scheme) -> Dict:
        return {
            "attribute": "education",
            "severity": "changeable",
            "current": "N/A",
            "required": scheme.get("education_level", ""),
            "suggestion": IMPROVEMENT_STEPS["education"]["mismatch"].format(
                required_edu=scheme.get("education_level", "")
            ),
        }

    def _analyze_occupation_gap(self, scheme) -> Dict:
        return {
            "attribute": "occupation",
            "severity": "changeable",
            "current": "N/A",
            "required": scheme.get("occupation", ""),
            "suggestion": IMPROVEMENT_STEPS["occupation"]["mismatch"].format(
                required_occ=scheme.get("occupation", "")
            ),
        }

    def _analyze_category_gap(self, scheme) -> Dict:
        return {
            "attribute": "category",
            "severity": "immutable",
            "current": "N/A",
            "required": scheme.get("target_group", ""),
            "suggestion": IMPROVEMENT_STEPS["category"]["mismatch"].format(
                required_group=scheme.get("target_group", "")
            ),
        }

    def _generate_summary(self, gaps, score_result, achievable) -> str:
        score = score_result.get("score", 0)
        if not gaps:
            return "You meet all eligibility criteria for this scheme!"
        if achievable:
            return (
                f"You currently match {score}% of the criteria. "
                f"There are {len(gaps)} gap(s) that can potentially be addressed. "
                f"Follow the improvement steps to increase your eligibility."
            )
        return (
            f"You match {score}% of the criteria. "
            f"Some requirements (like age or gender) cannot be changed. "
            f"Consider looking at alternative schemes."
        )


# ── Standalone Usage ──────────────────────────────────────────────────

if __name__ == "__main__":
    analyzer = EligibilityGapAnalyzer()

    profile = {"age": 16, "income": 300000, "state": "Delhi", "gender": "Male"}
    scheme = {
        "scheme_name": "Karnataka Girl Scholarship",
        "min_age": 18, "max_age": 25, "income_limit": 200000,
        "gender": "Female", "state": "Karnataka",
        "education_level": "Graduate", "target_group": "All",
    }
    score_result = {
        "score": 25,
        "status": "not_eligible",
        "matched_attributes": ["category"],
        "missing_criteria": ["Age 18-25", "Income under 2L", "Female only", "Karnataka only"],
        "attribute_scores": {
            "age": {"match": 0}, "income": {"match": 0},
            "state": {"match": 0}, "gender": {"match": 0},
            "education": {"match": 0}, "occupation": {"match": 1},
            "category": {"match": 1},
        },
    }

    result = analyzer.analyze(profile, scheme, score_result)
    print(f"Gaps: {result['gap_count']}")
    print(f"Achievable: {result['achievable']}")
    print(f"Summary: {result['summary']}")
    for step in result["improvement_steps"]:
        print(f"  → {step}")
