"""Generate Kannada mirror fields (category_kn, target_group_kn, state_kn,
plus scope_kn / audience_kn / tags_kn when those English-only fields exist)
for every scheme in dataset/schemes_multilingual.json.

Dictionaries here mirror the ones in src/lib/translateScheme.ts so the
dataset values match what the UI translates at runtime. Re-run after editing
either file to keep them in sync.
"""
from __future__ import annotations
import json, re
from pathlib import Path

DATASET = Path("dataset/schemes_multilingual.json")

CATEGORY_KN = {
    "education": "ಶಿಕ್ಷಣ",
    "employment": "ಉದ್ಯೋಗ",
    "health": "ಆರೋಗ್ಯ",
    "healthcare": "ಆರೋಗ್ಯ",
    "women & child": "ಮಹಿಳೆ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ",
    "women & child development": "ಮಹಿಳೆ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ",
    "social welfare": "ಸಾಮಾಜಿಕ ಕಲ್ಯಾಣ",
    "financial inclusion": "ಹಣಕಾಸು ಒಳಗೊಳ್ಳಿಕೆ",
    "entrepreneurship": "ಉದ್ಯಮಿತ್ವ",
    "women": "ಮಹಿಳೆಯರು",
    "youth": "ಯುವಕರು",
    "agriculture": "ಕೃಷಿ",
    "housing": "ವಸತಿ",
    "finance": "ಹಣಕಾಸು",
    "pension": "ಪಿಂಚಣಿ",
    "scholarship": "ವಿದ್ಯಾರ್ಥಿವೇತನ",
    "welfare": "ಕಲ್ಯಾಣ",
    "insurance": "ವಿಮೆ",
    "skill": "ಕೌಶಲ್ಯ",
    "skill development": "ಕೌಶಲ್ಯ ಅಭಿವೃದ್ಧಿ",
    "social": "ಸಾಮಾಜಿಕ",
    "rural": "ಗ್ರಾಮೀಣ",
    "urban": "ನಗರ",
}

TARGET_KN = {
    "all": "ಎಲ್ಲರೂ",
    "all citizens": "ಎಲ್ಲ ನಾಗರಿಕರು",
    "all indian citizens": "ಎಲ್ಲ ಭಾರತೀಯ ನಾಗರಿಕರು",
    "all indian residents": "ಎಲ್ಲ ಭಾರತೀಯ ನಿವಾಸಿಗಳು",
    "students": "ವಿದ್ಯಾರ್ಥಿಗಳು",
    "sc students": "SC ವಿದ್ಯಾರ್ಥಿಗಳು",
    "st students": "ST ವಿದ್ಯಾರ್ಥಿಗಳು",
    "obc students": "OBC ವಿದ್ಯಾರ್ಥಿಗಳು",
    "obc/sc students": "OBC/SC ವಿದ್ಯಾರ್ಥಿಗಳು",
    "obc entrepreneurs": "OBC ಉದ್ಯಮಿಗಳು",
    "farmers": "ರೈತರು",
    "small farmers": "ಸಣ್ಣ ರೈತರು",
    "farmer families": "ರೈತ ಕುಟುಂಬಗಳು",
    "women": "ಮಹಿಳೆಯರು",
    "bpl women": "BPL ಮಹಿಳೆಯರು",
    "women heads of family": "ಮಹಿಳಾ ಕುಟುಂಬ ಮುಖ್ಯಸ್ಥರು",
    "women & sc/st": "ಮಹಿಳೆಯರು ಮತ್ತು SC/ST ವರ್ಗಗಳು",
    "women & sc/st entrepreneurs": "ಮಹಿಳಾ ಮತ್ತು SC/ST ಉದ್ಯಮಿಗಳು",
    "youth": "ಯುವಕರು",
    "youth 15-45": "15-45 ವಯಸ್ಸಿನ ಯುವಕರು",
    "senior citizens": "ಹಿರಿಯ ನಾಗರಿಕರು",
    "minorities": "ಅಲ್ಪಸಂಖ್ಯಾತರು",
    "entrepreneurs": "ಉದ್ಯಮಿಗಳು",
    "small entrepreneurs": "ಸಣ್ಣ ಉದ್ಯಮಿಗಳು",
    "startups": "ಸ್ಟಾರ್ಟ್‌ಅಪ್‌ಗಳು",
    "unemployed": "ನಿರುದ್ಯೋಗಿಗಳು",
    "unemployed graduates": "ನಿರುದ್ಯೋಗಿ ಪದವೀಧರರು",
    "general": "ಸಾಮಾನ್ಯ",
    "households": "ಕುಟುಂಬಗಳು",
    "bpl families": "BPL ಕುಟುಂಬಗಳು",
    "apl families": "APL ಕುಟುಂಬಗಳು",
    "rural households": "ಗ್ರಾಮೀಣ ಕುಟುಂಬಗಳು",
    "urban households": "ನಗರ ಕುಟುಂಬಗಳು",
    "urban poor": "ನಗರ ಬಡವರು",
    "rural poor": "ಗ್ರಾಮೀಣ ಬಡವರು",
    "artisans": "ಕುಶಲಕರ್ಮಿಗಳು",
    "traditional artisans": "ಪಾರಂಪರಿಕ ಕುಶಲಕರ್ಮಿಗಳು",
    "workers": "ಕಾರ್ಮಿಕರು",
    "unorganised workers": "ಅಸಂಘಟಿತ ಕಾರ್ಮಿಕರು",
    "girls": "ಹುಡುಗಿಯರು",
    "boys": "ಹುಡುಗರು",
    "children": "ಮಕ್ಕಳು",
    "girl child": "ಹೆಣ್ಣು ಮಗು",
    "girl child bpl": "BPL ಹೆಣ್ಣು ಮಗು",
    "girl child under 10": "10 ವರ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ ವಯಸ್ಸಿನ ಹೆಣ್ಣು ಮಗು",
    "pregnant women": "ಗರ್ಭಿಣಿ ಮಹಿಳೆಯರು",
    "pregnant & lactating women": "ಗರ್ಭಿಣಿ ಮತ್ತು ಸ್ತನ್ಯಪಾನ ಮಾಡುವ ಮಹಿಳೆಯರು",
    "widows": "ವಿಧವೆಯರು",
    "school children": "ಶಾಲಾ ಮಕ್ಕಳು",
    "school students": "ಶಾಲಾ ವಿದ್ಯಾರ್ಥಿಗಳು",
    "class 9-12 students": "9-12ನೇ ತರಗತಿ ವಿದ್ಯಾರ್ಥಿಗಳು",
    "girl students": "ವಿದ್ಯಾರ್ಥಿನಿಯರು",
    "disabled students": "ಅಂಗವಿಕಲ ವಿದ್ಯಾರ್ಥಿಗಳು",
    "science students": "ವಿಜ್ಞಾನ ವಿದ್ಯಾರ್ಥಿಗಳು",
    "disabled persons": "ಅಂಗವಿಕಲ ವ್ಯಕ್ತಿಗಳು",
    "adults 18-50": "18-50 ವಯಸ್ಸಿನ ವಯಸ್ಕರು",
    "adults 18-65": "18-65 ವಯಸ್ಸಿನ ವಯಸ್ಕರು",
    "adults 18-70": "18-70 ವಯಸ್ಸಿನ ವಯಸ್ಕರು",
    "elderly": "ವೃದ್ಧರು",
    "disabled": "ಅಂಗವಿಕಲರು",
    "differently abled": "ವಿಶೇಷ ಚೇತನರು",
}

STATE_KN = {
    "all india": "ಅಖಿಲ ಭಾರತ",
    "karnataka": "ಕರ್ನಾಟಕ",
    "kerala": "ಕೇರಳ",
    "tamil nadu": "ತಮಿಳುನಾಡು",
    "andhra pradesh": "ಆಂಧ್ರಪ್ರದೇಶ",
    "telangana": "ತೆಲಂಗಾಣ",
    "maharashtra": "ಮಹಾರಾಷ್ಟ್ರ",
    "delhi": "ದೆಹಲಿ",
    "gujarat": "ಗುಜರಾತ್",
    "bihar": "ಬಿಹಾರ",
    "rajasthan": "ರಾಜಸ್ಥಾನ",
    "punjab": "ಪಂಜಾಬ್",
    "haryana": "ಹರಿಯಾಣ",
    "uttar pradesh": "ಉತ್ತರ ಪ್ರದೇಶ",
    "west bengal": "ಪಶ್ಚಿಮ ಬಂಗಾಳ",
    "madhya pradesh": "ಮಧ್ಯಪ್ರದೇಶ",
}

EXTRA_KN = {
    "national": "ರಾಷ್ಟ್ರೀಯ",
    "central": "ಕೇಂದ್ರ",
    "state": "ರಾಜ್ಯ",
    "regional": "ಪ್ರಾದೇಶಿಕ",
    "individual": "ವೈಯಕ್ತಿಕ",
    "family": "ಕುಟುಂಬ",
    "loan": "ಸಾಲ",
    "subsidy": "ಸಬ್ಸಿಡಿ",
    "scholarship": "ವಿದ್ಯಾರ್ಥಿವೇತನ",
    "pension": "ಪಿಂಚಣಿ",
    "insurance": "ವಿಮೆ",
    "welfare": "ಕಲ್ಯಾಣ",
}

METADATA_KN = {**CATEGORY_KN, **TARGET_KN, **STATE_KN, **EXTRA_KN}

def lookup(table: dict, value):
    if value is None or value == "":
        return value
    key = str(value).strip().lower()
    return table.get(key, value)

def translate_meta(value):
    if value is None or value == "":
        return value
    if isinstance(value, list):
        return [translate_meta(v) for v in value]
    return lookup(METADATA_KN, value)

MIRROR_FIELDS = [
    "category", "target_group", "state",
    "scope", "audience", "scheme_type", "region",
    "tags", "beneficiary_labels",
]

def main():
    data = json.loads(DATASET.read_text(encoding="utf-8"))
    untranslated = set()
    for s in data:
        for f in MIRROR_FIELDS:
            if f not in s:
                continue
            value = s[f]
            if value in (None, "", []):
                continue
            en_key, kn_key = f"{f}_en", f"{f}_kn"
            # Always set _en mirror if missing
            if en_key not in s or s.get(en_key) in (None, "", []):
                s[en_key] = value
            # Generate _kn mirror only when missing
            if kn_key not in s or s.get(kn_key) in (None, "", []):
                translated = translate_meta(value)
                s[kn_key] = translated
                # Track items that didn't get translated
                if isinstance(translated, str) and translated == value:
                    untranslated.add(value)
                elif isinstance(translated, list):
                    for orig, tr in zip(value, translated):
                        if tr == orig:
                            untranslated.add(orig)

    DATASET.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Updated {len(data)} schemes in {DATASET}")
    if untranslated:
        print(f"\n⚠ {len(untranslated)} value(s) had no Kannada mapping (left as-is):")
        for v in sorted(untranslated):
            print(f"   - {v}")
    else:
        print("✓ All metadata values translated to Kannada")

if __name__ == "__main__":
    main()
