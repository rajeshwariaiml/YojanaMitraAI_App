"""
NLP Entity Extractor Module
============================
Extracts demographic entities (age, gender, income, occupation,
education level, state, goals) from natural language user input
using pattern matching and keyword-based NLP techniques.

This module acts as the first stage of the recommendation pipeline,
converting unstructured conversational input into a structured user profile.
"""

import re
from typing import Dict, Any, List, Optional


# ── Keyword Dictionaries ──────────────────────────────────────────────

INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh",
]

OCCUPATIONS = {
    "farmer": ["farmer", "agriculture", "farming", "kisan", "cultivator"],
    "student": ["student", "studying", "college", "university", "school"],
    "entrepreneur": ["entrepreneur", "business", "startup", "self-employed", "shop"],
    "laborer": ["laborer", "labour", "worker", "daily wage", "construction"],
    "government employee": ["government employee", "govt job", "sarkari"],
    "unemployed": ["unemployed", "jobless", "no job", "looking for work"],
    "teacher": ["teacher", "professor", "lecturer", "teaching"],
    "healthcare": ["doctor", "nurse", "healthcare", "medical"],
}

EDUCATION_LEVELS = {
    "Below 10th": ["below 10th", "primary", "elementary", "no education", "illiterate"],
    "10th Pass": ["10th pass", "10th", "ssc", "matric", "matriculation"],
    "12th Pass": ["12th pass", "12th", "hsc", "intermediate", "plus two"],
    "Graduate": ["graduate", "graduation", "bachelor", "b.tech", "b.sc", "b.a", "b.com", "degree"],
    "Post Graduate": ["post graduate", "master", "m.tech", "m.sc", "m.a", "mba", "pg"],
    "Doctorate": ["phd", "doctorate", "doctoral"],
}

GENDER_KEYWORDS = {
    "Female": ["female", "woman", "girl", "daughter", "mother", "wife"],
    "Male": ["male", "man ", "boy", "son ", "father", "husband"],
}

CATEGORY_KEYWORDS = {
    "SC": ["scheduled caste", "dalit", " sc "],
    "ST": ["scheduled tribe", "tribal", "adivasi", " st "],
    "OBC": ["obc", "other backward class", "backward class"],
    "General": ["general", "unreserved", "open category"],
    "Minority": ["minority", "muslim", "christian", "sikh", "buddhist", "jain", "parsi"],
    "BPL": ["bpl", "below poverty line", "poor", "poverty"],
}


class NLPEntityExtractor:
    """
    Extracts structured demographic entities from natural language input.

    Pipeline Stage: 1 (Input Processing)

    Uses regex patterns and keyword dictionaries to identify:
    - Age (numeric extraction)
    - Gender (keyword matching)
    - Income (numeric + context extraction)
    - Occupation (synonym-based matching)
    - Education Level (keyword matching)
    - State (named entity matching)
    - Category (social category detection)
    - Goals (intent extraction)
    """

    def __init__(self):
        self.states_lower = {s.lower(): s for s in INDIAN_STATES}

    def extract(self, text: str) -> Dict[str, Any]:
        """
        Main extraction method. Parses free-text input and returns
        a structured profile dictionary.

        Args:
            text: Natural language input from user.

        Returns:
            Dictionary with keys: age, gender, income, occupation,
            education_level, state, category, goals
        """
        text_lower = text.lower().strip()

        profile = {
            "age": self._extract_age(text_lower),
            "gender": self._extract_gender(text_lower),
            "income": self._extract_income(text_lower),
            "occupation": self._extract_occupation(text_lower),
            "education_level": self._extract_education(text_lower),
            "state": self._extract_state(text_lower),
            "category": self._extract_category(text_lower),
            "goals": self._extract_goals(text_lower),
        }

        return profile

    def _extract_age(self, text: str) -> Optional[int]:
        """Extract age using regex patterns like '25 years old', 'age 30'."""
        patterns = [
            r'(?:i am|i\'m|age is|aged?)\s*(\d{1,3})',
            r'(\d{1,3})\s*(?:years?\s*old|yrs?\s*old|year)',
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                age = int(match.group(1))
                if 1 <= age <= 120:
                    return age
        return None

    def _extract_gender(self, text: str) -> Optional[str]:
        """Extract gender using keyword matching."""
        for gender, keywords in GENDER_KEYWORDS.items():
            for kw in keywords:
                if kw in text:
                    return gender
        return None

    def _extract_income(self, text: str) -> Optional[int]:
        """Extract annual income from text. Handles lakhs/thousands notation."""
        patterns = [
            r'(\d+\.?\d*)\s*(?:lakh|lac)',
            r'(?:income|earn|salary|earning)[^\d]*(\d[\d,]*)\s*(?:per\s*(?:month|annum|year))?',
            r'(\d[\d,]*)\s*(?:per\s*(?:month|annum|year))',
        ]
        for i, pattern in enumerate(patterns):
            match = re.search(pattern, text)
            if match:
                val = match.group(1).replace(",", "")
                if i == 0:  # lakhs pattern
                    return int(float(val) * 100000)
                num = int(float(val))
                if num < 100000 and "month" in text:
                    return num * 12
                return num
        return None

    def _extract_occupation(self, text: str) -> Optional[str]:
        """Extract occupation using synonym dictionary matching."""
        for occupation, keywords in OCCUPATIONS.items():
            for kw in keywords:
                if kw in text:
                    return occupation
        return None

    def _extract_education(self, text: str) -> Optional[str]:
        """Extract education level using keyword matching."""
        # Check longest matches first to avoid partial matches
        for level in ["Post Graduate", "Doctorate", "Graduate", "12th Pass", "10th Pass", "Below 10th"]:
            for kw in EDUCATION_LEVELS[level]:
                if kw in text:
                    return level
        return None

    def _extract_state(self, text: str) -> Optional[str]:
        """Extract Indian state name from text."""
        for state_lower, state_proper in self.states_lower.items():
            if state_lower in text:
                return state_proper
        return None

    def _extract_category(self, text: str) -> Optional[str]:
        """Extract social category (SC/ST/OBC/General/BPL)."""
        for category, keywords in CATEGORY_KEYWORDS.items():
            for kw in keywords:
                if kw in text:
                    return category
        return None

    def _extract_goals(self, text: str) -> List[str]:
        """Extract user goals/intents from text."""
        goal_patterns = {
            "education": ["scholarship", "education", "study", "tuition", "college fee"],
            "housing": ["house", "housing", "home", "awas", "shelter", "construction"],
            "healthcare": ["health", "medical", "hospital", "treatment", "insurance"],
            "employment": ["job", "employment", "work", "skill", "training", "startup"],
            "agriculture": ["farm", "crop", "irrigation", "kisan", "agriculture"],
            "financial_aid": ["loan", "subsidy", "financial", "money", "pension", "stipend"],
            "women_empowerment": ["women", "girl", "mahila", "maternity", "widow"],
        }
        goals = []
        for goal, keywords in goal_patterns.items():
            if any(kw in text for kw in keywords):
                goals.append(goal)
        return goals


# ── Standalone Usage ──────────────────────────────────────────────────

if __name__ == "__main__":
    extractor = NLPEntityExtractor()

    test_inputs = [
        "I am a 22 year old female student from Karnataka looking for scholarships",
        "I'm a farmer in Rajasthan, income is 1.5 lakh per annum, need help with crop insurance",
        "Male, 45, OBC, working as a laborer in Delhi, earning 8000 per month",
    ]

    for text in test_inputs:
        print(f"\nInput: {text}")
        profile = extractor.extract(text)
        for key, value in profile.items():
            if value:
                print(f"  {key}: {value}")
