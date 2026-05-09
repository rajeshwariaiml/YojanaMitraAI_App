"""
Rule-Based Eligibility Filter Module
======================================
Filters government schemes based on hard eligibility rules including
income thresholds, age limits, gender restrictions, geographic scope,
education requirements, and occupation constraints.

Boundary semantics (Part 3 fix):
- Age:    min_age <= user.age <= max_age   (inclusive on both ends)
- Income: user.income <= income_limit      (inclusive)
- We carefully use `is None` checks instead of `or 0` so that legitimate
  zero values (age=0 newborn schemes, income_limit=0 nil-income schemes)
  are not silently overwritten.
"""

from typing import Dict, Any, List, Tuple


class RuleBasedFilter:
    """
    Applies deterministic eligibility rules to filter schemes.

    Pipeline Stage: 2 (Rule-Based Filtering)

    A scheme passes the filter if it violates at most `max_violations` rules.
    """

    def __init__(self, max_violations: int = 3):
        self.max_violations = max_violations

    def filter_schemes(
        self, user_profile: Dict[str, Any], schemes: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        results = []
        for scheme in schemes:
            matched, violated = self._evaluate_rules(user_profile, scheme)
            total_rules = len(matched) + len(violated)

            if len(violated) <= self.max_violations and total_rules > 0:
                scheme_result = {
                    **scheme,
                    "matched_rules": matched,
                    "violated_rules": violated,
                    "rule_score": round((len(matched) / total_rules) * 100, 1)
                    if total_rules > 0 else 0,
                }
                results.append(scheme_result)
        return results

    @staticmethod
    def _coerce_int(val: Any, default: int) -> int:
        """None-safe int coercion that does NOT replace 0 with the default."""
        if val is None:
            return default
        try:
            return int(val)
        except (TypeError, ValueError):
            return default

    def _evaluate_rules(
        self, profile: Dict[str, Any], scheme: Dict[str, Any]
    ) -> Tuple[List[str], List[str]]:
        matched: List[str] = []
        violated: List[str] = []

        # Rule 1: Age Range  (inclusive on both ends)
        age = profile.get("age")
        min_age = self._coerce_int(scheme.get("min_age"), 0)
        max_age = self._coerce_int(scheme.get("max_age"), 100)
        if age is not None:
            try:
                age_int = int(age)
            except (TypeError, ValueError):
                age_int = None
            if age_int is None:
                matched.append("age_not_specified")
            elif min_age <= age_int <= max_age:
                matched.append("age_eligible")
            else:
                violated.append(f"Age must be {min_age}-{max_age}")
        else:
            matched.append("age_not_specified")

        # Rule 2: Income Limit  (inclusive)
        income = profile.get("income")
        income_limit = scheme.get("income_limit")
        if income is not None and income_limit is not None:
            try:
                if float(income) <= float(income_limit):
                    matched.append("income_eligible")
                else:
                    violated.append(f"Income must be under ₹{int(income_limit):,}")
            except (TypeError, ValueError):
                matched.append("income_not_restricted")
        else:
            matched.append("income_not_restricted")

        # Rule 3: Gender
        user_gender = profile.get("gender")
        scheme_gender = scheme.get("gender") or "All"
        if scheme_gender == "All" or user_gender is None:
            matched.append("gender_eligible")
        elif str(user_gender).strip().lower() == str(scheme_gender).strip().lower():
            matched.append("gender_eligible")
        else:
            violated.append(f"{scheme_gender} applicants only")

        # Rule 4: State / Geographic Scope
        user_state = profile.get("state")
        scheme_state = scheme.get("state") or "All India"
        if scheme_state == "All India" or user_state is None:
            matched.append("state_eligible")
        elif str(user_state).strip().lower() == str(scheme_state).strip().lower():
            matched.append("state_eligible")
        else:
            violated.append(f"Must be from {scheme_state}")

        # Rule 5: Education Level
        user_edu = profile.get("education_level")
        scheme_edu = scheme.get("education_level")
        if scheme_edu is None or user_edu is None:
            matched.append("education_not_restricted")
        elif str(user_edu).strip().lower() == str(scheme_edu).strip().lower():
            matched.append("education_eligible")
        else:
            violated.append(f"Requires {scheme_edu} education")

        # Rule 6: Occupation
        user_occ = profile.get("occupation")
        scheme_occ = scheme.get("occupation")
        if scheme_occ is None or user_occ is None:
            matched.append("occupation_not_restricted")
        elif str(user_occ).strip().lower() == str(scheme_occ).strip().lower():
            matched.append("occupation_eligible")
        else:
            violated.append(f"Requires {scheme_occ} occupation")

        # Rule 7: Target Group / Category
        user_cat = profile.get("category", "") or ""
        target = scheme.get("target_group") or "All"
        if target == "All" or not user_cat:
            matched.append("category_eligible")
        elif str(user_cat).strip().lower() in str(target).strip().lower():
            matched.append("category_eligible")
        else:
            violated.append(f"Target group: {target}")

        return matched, violated
