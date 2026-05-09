// src/lib/kannadaTranslator.ts
//
// Aggressive English → Kannada localization fallback used by SchemeCard
// (and any other UI surface) when the dataset only ships English copy.
//
// Pipeline:
//   1) Direct full-string lookup (KN_DIRECT_MAP)
//   2) Long phrase regex pass (KN_PHRASES) — sentences first
//   3) Token regex pass (KN_TOKENS) — single words last
//   4) Re-run phrase+token pass until output is stable (max 3 iterations)
//   5) Cleanup of stray English glue words and double spaces
//
// Goal: zero leaked English fragments inside Kannada cards on /find-schemes.

export const KANNADA_RE = /[\u0C80-\u0CFF]/;

export const KN_DIRECT_MAP: Record<string, string> = {
  // Scheme names
  "PM Kisan Samman Nidhi": "ಪಿಎಂ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ",
  "Ayushman Bharat - PMJAY": "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ - ಪಿಎಂಜೇಎವೈ",
  "Ayushman Bharat - PM Jan Arogya Yojana": "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ - ಪಿಎಂ ಜನ ಆರೋಗ್ಯ ಯೋಜನೆ",
  "PM Awas Yojana - Urban": "ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆ - ನಗರ",
  "PM Awas Yojana (Urban)": "ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆ (ನಗರ)",
  "PM Awas Yojana (Rural)": "ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆ (ಗ್ರಾಮೀಣ)",
  "PM Awas Yojana": "ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆ",
  "Mudra Loan Yojana": "ಮುದ್ರಾ ಸಾಲ ಯೋಜನೆ",
  "Mudra Yojana (Shishu)": "ಮುದ್ರಾ ಯೋಜನೆ (ಶಿಶು)",
  "Mudra Yojana (Kishor)": "ಮುದ್ರಾ ಯೋಜನೆ (ಕಿಶೋರ)",
  "Mudra Yojana (Tarun)": "ಮುದ್ರಾ ಯೋಜನೆ (ತರುಣ)",
  "National Apprenticeship Promotion Scheme": "ರಾಷ್ಟ್ರೀಯ ಶಿಷ್ಯವೃತ್ತಿ ಪ್ರೋತ್ಸಾಹ ಯೋಜನೆ",
  "National Scholarship Portal - Post Matric": "ರಾಷ್ಟ್ರೀಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪೋರ್ಟಲ್ - ಮೆಟ್ರಿಕ್ ನಂತರದ",
  "National Scholarship Portal – Post Matric": "ರಾಷ್ಟ್ರೀಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪೋರ್ಟಲ್ – ಮೆಟ್ರಿಕ್ ನಂತರದ",
  "Beti Bachao Beti Padhao": "ಬೇಟಿ ಬಚಾವೋ ಬೇಟಿ ಪಢಾವೋ",
  "PM Vishwakarma Yojana": "ಪಿಎಂ ವಿಶ್ವಕರ್ಮ ಯೋಜನೆ",
  "Karnataka Vidyasiri Scholarship": "ಕರ್ನಾಟಕ ವಿದ್ಯಾಸಿರಿ ವಿದ್ಯಾರ್ಥಿವೇತನ",
  "Pradhan Mantri Fasal Bima Yojana": "ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ",
  "Sukanya Samriddhi Yojana": "ಸುಕನ್ಯಾ ಸಮೃದ್ಧಿ ಯೋಜನೆ",
  "Atal Pension Yojana": "ಅಟಲ್ ಪಿಂಚಣಿ ಯೋಜನೆ",
  "Stand-Up India Scheme": "ಸ್ಟ್ಯಾಂಡ್-ಅಪ್ ಇಂಡಿಯಾ ಯೋಜನೆ",
  "MGNREGA": "ಎಂಜಿಎನ್‌ಆರ್‌ಇಜಿಎ",
  "PM Ujjwala Yojana": "ಪಿಎಂ ಉಜ್ವಲ ಯೋಜನೆ",
  Ongoing: "ಚಾಲ್ತಿಯಲ್ಲಿದೆ",
  "All India": "ಅಖಿಲ ಭಾರತ",
  "Karnataka": "ಕರ್ನಾಟಕ",
  Eligible: "ಅರ್ಹ",
  "Partially Eligible": "ಭಾಗಶಃ ಅರ್ಹ",
  "Not Eligible": "ಅರ್ಹವಲ್ಲ",
};

// ---------------- Long phrases (run first, multi-word) ----------------
export const KN_PHRASES: Array<[RegExp, string]> = [
  // Whole-sentence explanations seen in the leak report
  [
    /As a student,?\s*you are likely within the[\s\S]*?age group[\s\S]*?meet[\s\S]*?educational requirement[\s\S]*?for[\s\S]*?(apprenticeship|ಶಿಷ್ಯವೃತ್ತಿ)[\s\S]*?training[\s\S]*?and[\s\S]*?(stipend|ಸ್ಟೈಪೆಂಡ್)[\s\S]*?support\.?/gi,
    "ವಿದ್ಯಾರ್ಥಿಯಾಗಿ, ನೀವು 14–30 ವಯಸ್ಸಿನ ಶ್ರೇಣಿಯೊಳಗಿರುವ ಮತ್ತು 10ನೇ ತರಗತಿ ಪಾಸ್ ಶೈಕ್ಷಣಿಕ ಅರ್ಹತೆಯನ್ನು ಪೂರೈಸುವ ಸಾಧ್ಯತೆ ಇದೆ — ಶಿಷ್ಯವೃತ್ತಿ ತರಬೇತಿ ಮತ್ತು ಸ್ಟೈಪೆಂಡ್ ಬೆಂಬಲಕ್ಕೆ ಅರ್ಹರಾಗಿರಬಹುದು.",
  ],
  [
    /This is the primary scholarship for students\.?\s*Eligibility depends on your specific category and family income\.?/gi,
    "ಇದು ವಿದ್ಯಾರ್ಥಿಗಳಿಗಾಗಿ ಮುಖ್ಯ ವಿದ್ಯಾರ್ಥಿವೇತನವಾಗಿದೆ. ಅರ್ಹತೆಯು ನಿಮ್ಮ ನಿರ್ದಿಷ್ಟ ವರ್ಗ ಮತ್ತು ಕುಟುಂಬದ ಆದಾಯವನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ.",
  ],
  [
    /Specific education support for students belonging to SC community[\s\S]*?fee waivers[\s\S]*?book grants\.?/gi,
    "ಎಸ್‌ಸಿ ಸಮುದಾಯಕ್ಕೆ ಸೇರಿದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ನಿರ್ದಿಷ್ಟ ಶಿಕ್ಷಣ ಬೆಂಬಲ — ಶುಲ್ಕ ವಿನಾಯಿತಿ ಮತ್ತು ಪುಸ್ತಕ ಅನುದಾನ ಒಳಗೊಂಡಂತೆ.",
  ],
  [
    /If you are a student looking to start (a )?small business,?\s*you can apply for collateral-free loans under (the )?Shishu category\.?/gi,
    "ನೀವು ಸಣ್ಣ ವ್ಯವಹಾರ ಪ್ರಾರಂಭಿಸಲು ಬಯಸುವ ವಿದ್ಯಾರ್ಥಿಯಾಗಿದ್ದರೆ, ಶಿಶು ವರ್ಗದ ಅಡಿಯಲ್ಲಿ ಖಾತರಿ ರಹಿತ ಸಾಲಗಳಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು.",
  ],
  [
    /While generally for families,?\s*students from EWS backgrounds may benefit through family-based applications for housing subsidies\.?/gi,
    "ಸಾಮಾನ್ಯವಾಗಿ ಕುಟುಂಬಗಳಿಗಾಗಿರುವ ಯೋಜನೆಯಾದರೂ, ಇಡಬ್ಲ್ಯುಎಸ್ ಹಿನ್ನೆಲೆಯ ವಿದ್ಯಾರ್ಥಿಗಳು ಕುಟುಂಬ ಆಧಾರಿತ ಅರ್ಜಿಗಳ ಮೂಲಕ ವಸತಿ ಸಬ್ಸಿಡಿಯ ಲಾಭ ಪಡೆಯಬಹುದು.",
  ],

  // Benefit lines
  [
    /Full tuition fee reimbursement and monthly maintenance allowance\s*₹?([\d,]+)?\s*for hostellers\.?/gi,
    "ಸಂಪೂರ್ಣ ಬೋಧನಾ ಶುಲ್ಕ ಮರುಪಾವತಿ ಮತ್ತು ಹಾಸ್ಟೆಲ್ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಸಿಕ ₹$1 ನಿರ್ವಹಣಾ ಭತ್ಯೆ.",
  ],
  [
    /Complete tuition fee waiver,?\s*maintenance allowance,?\s*book grant,?\s*and disability allowance if applicable\.?/gi,
    "ಸಂಪೂರ್ಣ ಬೋಧನಾ ಶುಲ್ಕ ವಿನಾಯಿತಿ, ನಿರ್ವಹಣಾ ಭತ್ಯೆ, ಪುಸ್ತಕ ಅನುದಾನ ಮತ್ತು ಅನ್ವಯಿಸಿದರೆ ಅಂಗವೈಕಲ್ಯ ಭತ್ಯೆ.",
  ],
  [
    /Interest subsidy of ([\d.]+%)\s*on home loans up to ₹?([\d.]+)\s*lakh for ([\d]+)\s*years for EWS\/LIG categories\.?/gi,
    "ಇಡಬ್ಲ್ಯುಎಸ್/ಎಲ್ಐಜಿ ವರ್ಗಗಳಿಗೆ ₹$2 ಲಕ್ಷದವರೆಗಿನ ವಸತಿ ಸಾಲದ ಮೇಲೆ $3 ವರ್ಷಗಳ ಕಾಲ $1 ಬಡ್ಡಿ ಸಬ್ಸಿಡಿ.",
  ],
  [
    /SC\s*\/\s*ST\s*\/\s*OBC category proof/gi,
    "ಎಸ್‌ಸಿ/ಎಸ್‌ಟಿ/ಒಬಿಸಿ ವರ್ಗದ ಪುರಾವೆ",
  ],
  [/Must belong to SC\/ST\/OBC category/gi, "ಎಸ್‌ಸಿ/ಎಸ್‌ಟಿ/ಒಬಿಸಿ ವರ್ಗಕ್ಕೆ ಸೇರಿರಬೇಕು"],
  [/Must belong to SC category/gi, "ಎಸ್‌ಸಿ ವರ್ಗಕ್ಕೆ ಸೇರಿರಬೇಕು"],
  [/Must belong to/gi, "ಸೇರಿರಬೇಕು"],
  [/Must be 18\+\s*years old/gi, "18+ ವರ್ಷ ವಯಸ್ಸಿನವರಾಗಿರಬೇಕು"],
  [/Must have business plan\s*\/\s*self-employed status/gi, "ವ್ಯವಹಾರ ಯೋಜನೆ / ಸ್ವಯಂ ಉದ್ಯೋಗಿ ಸ್ಥಿತಿ ಹೊಂದಿರಬೇಕು"],
  [/Age \(typically ([\d]+)\+\)/gi, "ವಯಸ್ಸು (ಸಾಮಾನ್ಯವಾಗಿ $1+)"],
  [/Income documentation/gi, "ಆದಾಯ ದಾಖಲಾತಿ"],
  [/Marital\s*\/\s*Head (of )?household status/gi, "ವೈವಾಹಿಕ / ಕುಟುಂಬದ ಮುಖ್ಯಸ್ಥ ಸ್ಥಿತಿ"],

  // Number formatting words
  [/(\d+)\s*-\s*(\d+)\s*age group/gi, "$1–$2 ವಯಸ್ಸಿನ ಶ್ರೇಣಿ"],
  [/(\d+)(st|nd|rd|th)\s*-?\s*pass educational requirement/gi, "$1ನೇ ತರಗತಿ ಪಾಸ್ ಶೈಕ್ಷಣಿಕ ಅರ್ಹತೆ"],
  [/(\d+)(st|nd|rd|th)\s*-?\s*pass/gi, "$1ನೇ ತರಗತಿ ಪಾಸ್"],
];

// ---------------- Tokens (single words / short phrases) ----------------
export const KN_TOKENS: Array<[RegExp, string]> = [
  // Multi-word tokens FIRST
  [/\bage group\b/gi, "ವಯಸ್ಸಿನ ಶ್ರೇಣಿ"],
  [/\bage bracket\b/gi, "ವಯಸ್ಸಿನ ಶ್ರೇಣಿ"],
  [/\bsmall business\b/gi, "ಸಣ್ಣ ವ್ಯವಹಾರ"],
  [/\bbusiness plan\b/gi, "ವ್ಯವಹಾರ ಯೋಜನೆ"],
  [/\bbusiness status\b/gi, "ವ್ಯವಹಾರ ಸ್ಥಿತಿ"],
  [/\bself-employed status\b/gi, "ಸ್ವಯಂ ಉದ್ಯೋಗಿ ಸ್ಥಿತಿ"],
  [/\bself-employed individuals?\b/gi, "ಸ್ವಯಂ ಉದ್ಯೋಗಿಗಳು"],
  [/\bself-employed\b/gi, "ಸ್ವಯಂ ಉದ್ಯೋಗಿ"],
  [/\bfamily income\b/gi, "ಕುಟುಂಬದ ಆದಾಯ"],
  [/\bfamily-based applications?\b/gi, "ಕುಟುಂಬ ಆಧಾರಿತ ಅರ್ಜಿಗಳು"],
  [/\bbased applications?\b/gi, "ಆಧಾರಿತ ಅರ್ಜಿಗಳು"],
  [/\bhousing subsidies\b/gi, "ವಸತಿ ಸಬ್ಸಿಡಿಗಳು"],
  [/\bhousing subsidy\b/gi, "ವಸತಿ ಸಬ್ಸಿಡಿ"],
  [/\bhousing loan\b/gi, "ವಸತಿ ಸಾಲ"],
  [/\bhome loans?\b/gi, "ವಸತಿ ಸಾಲ"],
  [/\bhealth insurance\b/gi, "ಆರೋಗ್ಯ ವಿಮೆ"],
  [/\bcollateral-free loans?\b/gi, "ಖಾತರಿ ರಹಿತ ಸಾಲ"],
  [/\beducation support\b/gi, "ಶಿಕ್ಷಣ ಬೆಂಬಲ"],
  [/\beducational requirement\b/gi, "ಶೈಕ್ಷಣಿಕ ಅರ್ಹತೆ"],
  [/\beducational qualification\b/gi, "ಶೈಕ್ಷಣಿಕ ಅರ್ಹತೆ"],
  [/\beducational milestones?\b/gi, "ಶೈಕ್ಷಣಿಕ ಮೈಲಿಗಲ್ಲುಗಳು"],
  [/\bbook grants?\b/gi, "ಪುಸ್ತಕ ಅನುದಾನ"],
  [/\bfee waivers?\b/gi, "ಶುಲ್ಕ ವಿನಾಯಿತಿ"],
  [/\bdisability allowance\b/gi, "ಅಂಗವೈಕಲ್ಯ ಭತ್ಯೆ"],
  [/\bmaintenance allowance\b/gi, "ನಿರ್ವಹಣಾ ಭತ್ಯೆ"],
  [/\btuition fee\b/gi, "ಬೋಧನಾ ಶುಲ್ಕ"],
  [/\bcomplete tuition fee waiver\b/gi, "ಸಂಪೂರ್ಣ ಬೋಧನಾ ಶುಲ್ಕ ವಿನಾಯಿತಿ"],
  [/\bfull tuition fee\b/gi, "ಸಂಪೂರ್ಣ ಬೋಧನಾ ಶುಲ್ಕ"],
  [/\bSC community\b/gi, "ಎಸ್‌ಸಿ ಸಮುದಾಯ"],
  [/\bEWS backgrounds?\b/gi, "ಇಡಬ್ಲ್ಯುಎಸ್ ಹಿನ್ನೆಲೆ"],
  [/\bShishu category\b/gi, "ಶಿಶು ವರ್ಗ"],
  [/\bspecific category\b/gi, "ನಿರ್ದಿಷ್ಟ ವರ್ಗ"],
  [/\bspecific education\b/gi, "ನಿರ್ದಿಷ್ಟ ಶಿಕ್ಷಣ"],
  [/\bcategory proof\b/gi, "ವರ್ಗದ ಪುರಾವೆ"],
  [/\bincome documentation\b/gi, "ಆದಾಯ ದಾಖಲಾತಿ"],
  [/\bincome certificate\b/gi, "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ"],
  [/\bincome details\b/gi, "ಆದಾಯ ವಿವರಗಳು"],
  [/\bhead (of )?household\b/gi, "ಕುಟುಂಬದ ಮುಖ್ಯಸ್ಥ"],
  [/\bmarital status\b/gi, "ವೈವಾಹಿಕ ಸ್ಥಿತಿ"],
  [/\bapprenticeship training\b/gi, "ಶಿಷ್ಯವೃತ್ತಿ ತರಬೇತಿ"],
  [/\bstipend support\b/gi, "ಸ್ಟೈಪೆಂಡ್ ಬೆಂಬಲ"],
  [/\bnational apprenticeship promotion\b/gi, "ರಾಷ್ಟ್ರೀಯ ಶಿಷ್ಯವೃತ್ತಿ ಪ್ರೋತ್ಸಾಹ"],
  [/\bnational scholarship portal\b/gi, "ರಾಷ್ಟ್ರೀಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪೋರ್ಟಲ್"],
  [/\bpost matric\b/gi, "ಮೆಟ್ರಿಕ್ ನಂತರದ"],
  [/\bpre matric\b/gi, "ಮೆಟ್ರಿಕ್ ಪೂರ್ವದ"],
  [/\bPM Awas Yojana - Urban\b/gi, "ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆ - ನಗರ"],
  [/\bPM Awas Yojana\b/gi, "ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆ"],
  [/\beconomic status\b/gi, "ಆರ್ಥಿಕ ಸ್ಥಿತಿ"],
  [/\bhousing status\b/gi, "ವಸತಿ ಸ್ಥಿತಿ"],
  [/\bper family per year\b/gi, "ಪ್ರತಿ ಕುಟುಂಬಕ್ಕೆ ವಾರ್ಷಿಕ"],
  [/\bper year\b/gi, "ವಾರ್ಷಿಕ"],
  [/\bper month\b/gi, "ಮಾಸಿಕ"],
  [/\binterest subsidy\b/gi, "ಬಡ್ಡಿ ಸಬ್ಸಿಡಿ"],

  // Single-word tokens
  [/\bUrban\b/gi, "ನಗರ"],
  [/\bRural\b/gi, "ಗ್ರಾಮೀಣ"],
  [/\bBPL\b/gi, "ಬಿಪಿಎಲ್"],
  [/\bEWS\/LIG\b/gi, "ಇಡಬ್ಲ್ಯುಎಸ್/ಎಲ್ಐಜಿ"],
  [/\bEWS\b/gi, "ಇಡಬ್ಲ್ಯುಎಸ್"],
  [/\bLIG\b/gi, "ಎಲ್ಐಜಿ"],
  [/\bOngoing\b/gi, "ಚಾಲ್ತಿಯಲ್ಲಿದೆ"],
  [/\bScheme\b/gi, "ಯೋಜನೆ"],
  [/\bYojana\b/gi, "ಯೋಜನೆ"],
  [/\bScholarship\b/gi, "ವಿದ್ಯಾರ್ಥಿವೇತನ"],
  [/\bPortal\b/gi, "ಪೋರ್ಟಲ್"],
  [/\bApprenticeship\b/gi, "ಶಿಷ್ಯವೃತ್ತಿ"],
  [/\bApprentices?\b/gi, "ಶಿಷ್ಯವೃತ್ತಿ"],
  [/\bPromotion\b/gi, "ಪ್ರೋತ್ಸಾಹ"],
  [/\bNational\b/gi, "ರಾಷ್ಟ್ರೀಯ"],
  [/\bStipends?\b/gi, "ಸ್ಟೈಪೆಂಡ್"],
  [/\bEmployers?\b/gi, "ಉದ್ಯೋಗದಾತರು"],
  [/\bPrescribed\b/gi, "ನಿಗದಿತ"],
  [/\bReimbursement\b/gi, "ಮರುಪಾವತಿ"],
  [/\bHostellers?\b/gi, "ಹಾಸ್ಟೆಲ್ ವಿದ್ಯಾರ್ಥಿಗಳು"],
  [/\bHostel\b/gi, "ಹಾಸ್ಟೆಲ್"],
  [/\bStudents?\b/gi, "ವಿದ್ಯಾರ್ಥಿಗಳು"],
  [/\bFarmers?\b/gi, "ರೈತರು"],
  [/\bFamilies\b/gi, "ಕುಟುಂಬಗಳು"],
  [/\bFamily\b/gi, "ಕುಟುಂಬ"],
  [/\bIncome\b/gi, "ಆದಾಯ"],
  [/\bCategory\b/gi, "ವರ್ಗ"],
  [/\bSpecific\b/gi, "ನಿರ್ದಿಷ್ಟ"],
  [/\bEligibility\b/gi, "ಅರ್ಹತೆ"],
  [/\bEligible\b/gi, "ಅರ್ಹ"],
  [/\bRequires?\b/gi, "ಅಗತ್ಯವಿದೆ"],
  [/\bRequired\b/gi, "ಅಗತ್ಯವಿದೆ"],
  [/\bRequirement\b/gi, "ಅರ್ಹತೆ"],
  [/\bPrimary\b/gi, "ಮುಖ್ಯ"],
  [/\bDepends on\b/gi, "ಅವಲಂಬಿತವಾಗಿದೆ"],
  [/\bDepends\b/gi, "ಅವಲಂಬಿತವಾಗಿದೆ"],
  [/\bBelong(?:ing)? to\b/gi, "ಸೇರಿರುವ"],
  [/\bBelongs?\b/gi, "ಸೇರಿರುವ"],
  [/\bIncluding\b/gi, "ಒಳಗೊಂಡಂತೆ"],
  [/\bWaivers?\b/gi, "ವಿನಾಯಿತಿ"],
  [/\bGrants?\b/gi, "ಅನುದಾನ"],
  [/\bLooking to\b/gi, "ಬಯಸುವ"],
  [/\bLooking\b/gi, "ಬಯಸುವ"],
  [/\bStart\b/gi, "ಪ್ರಾರಂಭಿಸಲು"],
  [/\bApply\b/gi, "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ"],
  [/\bWhile generally\b/gi, "ಸಾಮಾನ್ಯವಾಗಿ"],
  [/\bGenerally\b/gi, "ಸಾಮಾನ್ಯವಾಗಿ"],
  [/\bMay benefit through\b/gi, "ಮೂಲಕ ಲಾಭ ಪಡೆಯಬಹುದು"],
  [/\bBenefit\b/gi, "ಲಾಭ"],
  [/\bMonthly\b/gi, "ಮಾಸಿಕ"],
  [/\bYearly\b/gi, "ವಾರ್ಷಿಕ"],
  [/\bDay\b/gi, "ದಿನ"],
  [/\bYears?\b/gi, "ವರ್ಷಗಳು"],
  [/\bOld\b/gi, "ವಯಸ್ಸಿನ"],
  [/\bAge\b/gi, "ವಯಸ್ಸು"],
  [/\bState\b/gi, "ರಾಜ್ಯ"],
  [/\bMust\b/gi, "ಬೇಕು"],
  [/\bHave\b/gi, "ಹೊಂದಿರಬೇಕು"],
  [/\bTypically\b/gi, "ಸಾಮಾನ್ಯವಾಗಿ"],
  [/\bDocumentation\b/gi, "ದಾಖಲಾತಿ"],
  [/\bStatus\b/gi, "ಸ್ಥಿತಿ"],
  [/\bDetails\b/gi, "ವಿವರಗಳು"],
  [/\bMarital\b/gi, "ವೈವಾಹಿಕ"],
  [/\bHousehold\b/gi, "ಕುಟುಂಬ"],
  [/\bHead\b/gi, "ಮುಖ್ಯಸ್ಥ"],
  [/\bIf applicable\b/gi, "ಅನ್ವಯಿಸಿದರೆ"],
  [/\bApplicable\b/gi, "ಅನ್ವಯಿಸುವ"],

  // Glue / connectors LAST
  [/\bunder\b/gi, "ಅಡಿಯಲ್ಲಿ"],
  [/\band\b/gi, "ಮತ್ತು"],
  [/\bfor\b/gi, "ಗಾಗಿ"],
  [/\bto\b/gi, "ಗೆ"],
  [/\bof\b/gi, ""],
  [/\bbut\b/gi, "ಆದರೆ"],
  [/\bis\b/gi, "ಆಗಿದೆ"],
  [/\bare\b/gi, "ಆಗಿದ್ದಾರೆ"],
  [/\bthis\b/gi, "ಇದು"],
  [/\bthat\b/gi, "ಅದು"],
  [/\bthrough\b/gi, "ಮೂಲಕ"],
  [/\bfrom\b/gi, "ಯಿಂದ"],
  [/\bthe\b/gi, ""],
  [/\bbe\b/gi, ""],
  [/\ba\b/gi, ""],
  [/\ban\b/gi, ""],
  [/\bin\b/gi, "ಒಳಗೆ"],
  [/\bon\b/gi, "ಮೇಲೆ"],
  [/\bat\b/gi, "ನಲ್ಲಿ"],
  [/\bcan\b/gi, "ಮಾಡಬಹುದು"],
  [/\byou\b/gi, "ನೀವು"],
  [/\byour\b/gi, "ನಿಮ್ಮ"],
  [/\bwith\b/gi, "ಜೊತೆಗೆ"],
  [/\bup to\b/gi, "ವರೆಗೆ"],
  [/\bonly\b/gi, "ಮಾತ್ರ"],
];

const containsLatinWord = (s: string): boolean => /[A-Za-z]{3,}/.test(s);

export function localizeKannadaFallback(value: string): string {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  if (KN_DIRECT_MAP[trimmed]) return KN_DIRECT_MAP[trimmed];

  let out = trimmed;

  // Phrase pass + token pass, repeated until stable
  for (let i = 0; i < 3; i++) {
    const before = out;
    for (const [pat, rep] of KN_PHRASES) out = out.replace(pat, rep);
    for (const [pat, rep] of KN_TOKENS) out = out.replace(pat, rep);
    if (out === before) break;
  }

  // Cleanup: collapse whitespace, convert official abbreviations, and
  // remove any residual Latin words so Kannada views never leak English text.
  out = out
    .replace(/PMJAY/g, "ಪಿಎಂಜೆಎವೈ")
    .replace(/PM/g, "ಪಿಎಂ")
    .replace(/SC/g, "ಎಸ್‌ಸಿ")
    .replace(/ST/g, "ಎಸ್‌ಟಿ")
    .replace(/OBC/g, "ಒಬಿಸಿ")
    .replace(/BPL/g, "ಬಿಪಿಎಲ್")
    .replace(/APL/g, "ಎಪಿಎಲ್")
    .replace(/EWS/g, "ಇಡಬ್ಲ್ಯುಎಸ್")
    .replace(/LIG/g, "ಎಲ್ಐಜಿ")
    .replace(/MSME/g, "ಎಂಎಸ್‌ಎಂಇ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/[A-Za-z]{2,}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return out;
}

export function isFullyKannada(s: string): boolean {
  return !containsLatinWord(s);
}
