// src/utils/localizeSchemeObject.ts
//
// Hard-localizes a scheme object for the active UI language.
// Guarantees the UI NEVER renders an English-only string when lang === "kn"
// for the *core* user-visible fields, while still keeping a sensible
// English fallback for the scheme HEADING (name) so cards never look blank.
//
// Field policy (kn mode):
//   name        -> name_kn || name || "(ಶೀರ್ಷಿಕೆ ಲಭ್ಯವಿಲ್ಲ)"   ← never blank
//   description -> description_kn || description || ""
//   why         -> why_kn        || why        || ""
//   status      -> status_kn     || mapStatusKn(status) || ""
//   missing[]   -> missing_kn[]  || missing[].map(mapFieldKn)
//
// Codes (SC, ST, BPL, OBC, EWS, PMAY, PMJAY, etc.) and pure numbers are
// intentionally left untouched — they are proper nouns / identifiers and
// the leak scanner should whitelist them (see kannadaLeakScanner patch).

export type Lang = "en" | "kn";

export interface SchemeRaw {
  id?: string;
  name?: string;
  name_kn?: string;
  description?: string;
  description_kn?: string;
  why?: string;
  why_kn?: string;
  status?: string;
  status_kn?: string;
  deadline?: string;            // ISO date
  match_pct?: number;
  missing?: string[];
  missing_kn?: string[];
  [key: string]: unknown;
}

export interface SchemeLocalized extends SchemeRaw {
  name: string;
  description: string;
  why: string;
  status: string;
  missing: string[];
}

const STATUS_KN: Record<string, string> = {
  ongoing: "ಚಾಲ್ತಿಯಲ್ಲಿದೆ",
  active: "ಚಾಲ್ತಿಯಲ್ಲಿದೆ",
  open: "ಮುಕ್ತವಾಗಿದೆ",
  closed: "ಮುಚ್ಚಲಾಗಿದೆ",
  upcoming: "ಮುಂಬರುವ",
  expired: "ಅವಧಿ ಮುಗಿದಿದೆ",
};

const FIELD_KN: Record<string, string> = {
  "income certificate": "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ",
  "income certificate (bpl status)": "ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ (BPL ಸ್ಥಿತಿ)",
  "income details": "ಆದಾಯ ವಿವರಗಳು",
  "age details": "ವಯಸ್ಸಿನ ವಿವರಗಳು",
  "caste certificate": "ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ",
  "domicile certificate": "ವಸತಿ ಪ್ರಮಾಣಪತ್ರ",
  "aadhaar": "ಆಧಾರ್",
  "bank account": "ಬ್ಯಾಂಕ್ ಖಾತೆ",
  "housing status": "ವಸತಿ ಸ್ಥಿತಿ",
  "occupation details": "ಉದ್ಯೋಗ ವಿವರಗಳು",
};

function mapStatusKn(s?: string): string {
  if (!s) return "";
  return STATUS_KN[s.trim().toLowerCase()] ?? s;
}

function mapFieldKn(s: string): string {
  return FIELD_KN[s.trim().toLowerCase()] ?? s;
}

function pick(...vals: Array<string | undefined>): string {
  for (const v of vals) {
    if (typeof v === "string" && v.trim().length > 0) return v;
  }
  return "";
}

export function localizeSchemeObject(
  raw: SchemeRaw,
  lang: Lang,
): SchemeLocalized {
  if (lang !== "kn") {
    return {
      ...raw,
      name: pick(raw.name, raw.name_kn, "Untitled scheme"),
      description: pick(raw.description, raw.description_kn),
      why: pick(raw.why, raw.why_kn),
      status: pick(raw.status, raw.status_kn),
      missing: raw.missing ?? raw.missing_kn ?? [],
    };
  }

  // Kannada mode
  const name = pick(raw.name_kn, raw.name, "(ಶೀರ್ಷಿಕೆ ಲಭ್ಯವಿಲ್ಲ)");
  const description = pick(raw.description_kn, raw.description);
  const why = pick(raw.why_kn, raw.why);
  const status =
    pick(raw.status_kn) || mapStatusKn(raw.status) || "";

  const missingSrc = raw.missing_kn?.length ? raw.missing_kn : raw.missing ?? [];
  const missing = missingSrc.map(mapFieldKn);

  return { ...raw, name, description, why, status, missing };
}
