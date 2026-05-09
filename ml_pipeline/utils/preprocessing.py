"""
Preprocessing Utilities
========================
Helper functions for text cleaning, normalization, and data
preparation used across the ML pipeline modules.
"""

import re
from typing import List, Optional


def clean_text(text: str) -> str:
    """Remove extra whitespace, special characters, and normalize text."""
    text = text.strip().lower()
    text = re.sub(r'[^\w\s.,₹/-]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text


def normalize_income(value: str) -> Optional[int]:
    """
    Normalize income strings to annual integer values.

    Handles: "1.5 lakh", "150000", "15,000/month", "₹2L"
    """
    value = value.lower().replace("₹", "").replace(",", "").strip()

    # Handle lakh notation
    lakh_match = re.search(r'(\d+\.?\d*)\s*(?:lakh|lac|l)', value)
    if lakh_match:
        return int(float(lakh_match.group(1)) * 100000)

    # Handle monthly to annual conversion
    num_match = re.search(r'(\d+)', value)
    if num_match:
        num = int(num_match.group(1))
        if "month" in value:
            return num * 12
        return num

    return None


def format_currency(amount: int) -> str:
    """Format number as Indian currency string."""
    if amount >= 10000000:
        return f"₹{amount / 10000000:.1f} Cr"
    if amount >= 100000:
        return f"₹{amount / 100000:.1f} L"
    return f"₹{amount:,}"


def tokenize(text: str) -> List[str]:
    """Simple whitespace tokenizer with stopword removal."""
    stopwords = {
        "i", "am", "a", "an", "the", "is", "are", "was", "were",
        "in", "on", "at", "to", "for", "of", "with", "and", "or",
        "my", "me", "from", "have", "has", "been", "being", "be",
        "do", "does", "did", "will", "would", "can", "could",
        "that", "this", "these", "those", "it", "its",
    }
    words = clean_text(text).split()
    return [w for w in words if w not in stopwords]


def extract_numbers(text: str) -> List[int]:
    """Extract all numeric values from text."""
    return [int(n) for n in re.findall(r'\d+', text)]
