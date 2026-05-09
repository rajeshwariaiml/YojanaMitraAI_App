// src/lib/validateProfileInput.ts
//
// Zod-based validation for the FindSchemes profile form.
// Returns bilingual error messages so the InvalidInputDialog
// can render directly in the user's selected language.
//
// Usage:
//   import { validateProfileInput } from "@/lib/validateProfileInput";
//   const result = validateProfileInput(form, language);
//   if (!result.ok) { setInvalidErrors(result.errors); return; }

import { z } from "zod";

export type Lang = "en" | "kn";

export interface ProfileFormInput {
  age?: number | string | null;
  income?: number | string | null;
  state?: string | null;
  category?: string | null;
  occupation?: string | null;
  gender?: string | null;
  education?: string | null;
  // Allow extra fields without breaking validation
  [k: string]: unknown;
}

const T = (en: string, kn: string, lang: Lang) => (lang === "kn" ? kn : en);

const toNum = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[, _]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateProfileInput(
  input: ProfileFormInput,
  lang: Lang = "en",
): ValidationResult {
  const errors: string[] = [];

  // ---- Age ----
  const ageNum = toNum(input.age);
  if (input.age === undefined || input.age === null || input.age === "") {
    errors.push(T("Age is required.", "ವಯಸ್ಸು ಅಗತ್ಯವಿದೆ.", lang));
  } else if (Number.isNaN(ageNum)) {
    errors.push(
      T("Age must be a number.", "ವಯಸ್ಸು ಸಂಖ್ಯೆಯಾಗಿರಬೇಕು.", lang),
    );
  } else if (ageNum! < 1 || ageNum! > 120) {
    errors.push(
      T(
        "Age must be between 1 and 120.",
        "ವಯಸ್ಸು 1 ರಿಂದ 120 ರ ನಡುವೆ ಇರಬೇಕು.",
        lang,
      ),
    );
  }

  // ---- Income ----
  const incomeNum = toNum(input.income);
  if (input.income !== undefined && input.income !== null && input.income !== "") {
    if (Number.isNaN(incomeNum)) {
      errors.push(
        T(
          "Annual income must be a valid number.",
          "ವಾರ್ಷಿಕ ಆದಾಯ ಮಾನ್ಯ ಸಂಖ್ಯೆಯಾಗಿರಬೇಕು.",
          lang,
        ),
      );
    } else if (incomeNum! < 0) {
      errors.push(
        T(
          "Annual income cannot be negative.",
          "ವಾರ್ಷಿಕ ಆದಾಯವು ಋಣಾತ್ಮಕವಾಗಿರಲು ಸಾಧ್ಯವಿಲ್ಲ.",
          lang,
        ),
      );
    } else if (incomeNum! > 1_00_00_00_000) {
      errors.push(
        T(
          "Annual income value seems unrealistic.",
          "ವಾರ್ಷಿಕ ಆದಾಯ ಮೌಲ್ಯ ಅವಾಸ್ತವಿಕವಾಗಿ ಕಾಣುತ್ತದೆ.",
          lang,
        ),
      );
    }
  }

  // ---- State ----
  const stateSchema = z
    .string()
    .trim()
    .min(2, T("State is required.", "ರಾಜ್ಯ ಅಗತ್ಯವಿದೆ.", lang))
    .max(60, T("State name is too long.", "ರಾಜ್ಯದ ಹೆಸರು ತುಂಬಾ ಉದ್ದವಾಗಿದೆ.", lang))
    .regex(
      /^[A-Za-z\u0C80-\u0CFF\s().&-]+$/,
      T(
        "State contains invalid characters.",
        "ರಾಜ್ಯವು ಅಮಾನ್ಯ ಅಕ್ಷರಗಳನ್ನು ಒಳಗೊಂಡಿದೆ.",
        lang,
      ),
    );
  const stateRes = stateSchema.safeParse(input.state ?? "");
  if (!stateRes.success) {
    for (const issue of stateRes.error.issues) errors.push(issue.message);
  }

  // ---- Free-text fields: length + injection-safe characters ----
  const safeText = (
    val: unknown,
    fieldEn: string,
    fieldKn: string,
    required = false,
  ) => {
    const s = (val ?? "").toString().trim();
    if (!s) {
      if (required) {
        errors.push(
          T(`${fieldEn} is required.`, `${fieldKn} ಅಗತ್ಯವಿದೆ.`, lang),
        );
      }
      return;
    }
    if (s.length > 80) {
      errors.push(
        T(
          `${fieldEn} must be under 80 characters.`,
          `${fieldKn} 80 ಅಕ್ಷರಗಳಿಗಿಂತ ಕಡಿಮೆ ಇರಬೇಕು.`,
          lang,
        ),
      );
    }
    if (/[<>{};\\]/.test(s)) {
      errors.push(
        T(
          `${fieldEn} contains invalid characters.`,
          `${fieldKn} ಅಮಾನ್ಯ ಅಕ್ಷರಗಳನ್ನು ಒಳಗೊಂಡಿದೆ.`,
          lang,
        ),
      );
    }
  };

  safeText(input.category, "Category", "ವರ್ಗ");
  safeText(input.occupation, "Occupation", "ಉದ್ಯೋಗ");
  safeText(input.gender, "Gender", "ಲಿಂಗ");
  safeText(input.education, "Education", "ಶಿಕ್ಷಣ");

  return { ok: errors.length === 0, errors };
}
