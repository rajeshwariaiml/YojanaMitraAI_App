// src/lib/validateDescription.ts
// Bilingual (EN/KN) validation for the conversational / description box.
// Returns one OR MORE specific errors so the popup can show all problems at once.

export type Lang = "en" | "kn" | string;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

const MIN_CHARS = 10;
const MAX_CHARS = 500;
const MIN_WORDS = 2;
const MIN_LETTERS = 3;

const MSG = {
  empty: {
    en: "Description cannot be empty.",
    kn: "ವಿವರಣೆ ಖಾಲಿಯಾಗಿರಬಾರದು.",
  },
  tooShort: {
    en: `Description is too short. Please enter at least ${MIN_CHARS} characters describing your situation.`,
    kn: `ವಿವರಣೆ ತುಂಬಾ ಚಿಕ್ಕದಾಗಿದೆ. ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ${MIN_CHARS} ಅಕ್ಷರಗಳನ್ನು ನಮೂದಿಸಿ.`,
  },
  tooLong: {
    en: `Description is too long. Please keep it under ${MAX_CHARS} characters.`,
    kn: `ವಿವರಣೆ ತುಂಬಾ ಉದ್ದವಾಗಿದೆ. ದಯವಿಟ್ಟು ${MAX_CHARS} ಅಕ್ಷರಗಳಿಗಿಂತ ಕಡಿಮೆ ಇರಿಸಿ.`,
  },
  needWords: {
    en: `Please enter at least ${MIN_WORDS} meaningful words.`,
    kn: `ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ${MIN_WORDS} ಅರ್ಥಪೂರ್ಣ ಪದಗಳನ್ನು ನಮೂದಿಸಿ.`,
  },
  needLetters: {
    en: "Description must contain real words, not just symbols or numbers.",
    kn: "ವಿವರಣೆಯಲ್ಲಿ ಕೇವಲ ಚಿಹ್ನೆಗಳು ಅಥವಾ ಸಂಖ್ಯೆಗಳಲ್ಲ, ನಿಜವಾದ ಪದಗಳಿರಬೇಕು.",
  },
  repeated: {
    en: "Please avoid repeating the same character (e.g. 'aaaaaa').",
    kn: "ಒಂದೇ ಅಕ್ಷರವನ್ನು ಪುನರಾವರ್ತಿಸಬೇಡಿ (ಉದಾ: 'aaaaaa').",
  },
  singleChar: {
    en: "Please type a full sentence, not just one letter.",
    kn: "ದಯವಿಟ್ಟು ಒಂದು ಪೂರ್ಣ ವಾಕ್ಯ ಬರೆಯಿರಿ, ಕೇವಲ ಒಂದು ಅಕ್ಷರವಲ್ಲ.",
  },
  urlOnly: {
    en: "Please describe your situation in words, not just a link.",
    kn: "ದಯವಿಟ್ಟು ಪದಗಳಲ್ಲಿ ವಿವರಿಸಿ, ಕೇವಲ ಲಿಂಕ್ ಬೇಡ.",
  },
  scriptUnsafe: {
    en: "Please remove HTML or script characters from your description.",
    kn: "ದಯವಿಟ್ಟು HTML ಅಥವಾ ಸ್ಕ್ರಿಪ್ಟ್ ಚಿಹ್ನೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ.",
  },
} as const;

const pick = (k: keyof typeof MSG, lang: Lang) =>
  lang === "kn" ? MSG[k].kn : MSG[k].en;

export function validateDescription(raw: string, lang: Lang = "en"): ValidationResult {
  const errors: string[] = [];
  const text = (raw ?? "").trim();

  if (text.length === 0) {
    errors.push(pick("empty", lang));
    return { ok: false, errors };
  }

  if (text.length === 1) errors.push(pick("singleChar", lang));
  if (text.length < MIN_CHARS) errors.push(pick("tooShort", lang));
  if (text.length > MAX_CHARS) errors.push(pick("tooLong", lang));

  const words = text.split(/\s+/).filter((w) => w.length >= 2);
  if (words.length < MIN_WORDS) errors.push(pick("needWords", lang));

  const letterCount = (text.match(/[A-Za-z\u0C80-\u0CFF]/g) ?? []).length;
  if (letterCount < MIN_LETTERS) errors.push(pick("needLetters", lang));

  if (/(.)\1{4,}/.test(text)) errors.push(pick("repeated", lang));

  // URL-only input
  if (/^https?:\/\/\S+$/i.test(text)) errors.push(pick("urlOnly", lang));

  // Script / HTML injection guard
  if (/<\s*script|<\s*\/\s*script|<\s*iframe|onerror\s*=/i.test(text)) {
    errors.push(pick("scriptUnsafe", lang));
  }

  return { ok: errors.length === 0, errors: Array.from(new Set(errors)) };
}

// ---- Form-field validation (age, income, state) -----------------------------

export interface FormProfile {
  age?: string;
  income?: string;
  state?: string;
  gender?: string;
}

const FMSG = {
  ageRequired: { en: "Age is required.", kn: "ವಯಸ್ಸು ಅಗತ್ಯವಿದೆ." },
  ageInvalid: {
    en: "Age must be a whole number between 1 and 120.",
    kn: "ವಯಸ್ಸು 1 ರಿಂದ 120 ರ ನಡುವೆ ಪೂರ್ಣ ಸಂಖ್ಯೆ ಆಗಿರಬೇಕು.",
  },
  stateRequired: {
    en: "Please select your state.",
    kn: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
  },
  incomeInvalid: {
    en: "Annual income must be a non-negative number under ₹10,00,00,000.",
    kn: "ವಾರ್ಷಿಕ ಆದಾಯವು ಋಣಾತ್ಮಕವಲ್ಲದ ಸಂಖ್ಯೆಯಾಗಿರಬೇಕು ಮತ್ತು ₹10,00,00,000 ಗಿಂತ ಕಡಿಮೆ ಇರಬೇಕು.",
  },
} as const;

const fpick = (k: keyof typeof FMSG, lang: Lang) =>
  lang === "kn" ? FMSG[k].kn : FMSG[k].en;

export function validateProfileForm(form: FormProfile, lang: Lang = "en"): ValidationResult {
  const errors: string[] = [];

  // Age
  if (!form.age || !form.age.toString().trim()) {
    errors.push(fpick("ageRequired", lang));
  } else {
    const ageNum = Number(form.age);
    if (!Number.isFinite(ageNum) || !Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) {
      errors.push(fpick("ageInvalid", lang));
    }
  }

  // State
  if (!form.state || !form.state.toString().trim()) {
    errors.push(fpick("stateRequired", lang));
  }

  // Income (optional but if provided must be valid)
  if (form.income && form.income.toString().trim()) {
    const inc = Number(form.income);
    if (!Number.isFinite(inc) || inc < 0 || inc > 1_000_000_000) {
      errors.push(fpick("incomeInvalid", lang));
    }
  }

  return { ok: errors.length === 0, errors };
}
