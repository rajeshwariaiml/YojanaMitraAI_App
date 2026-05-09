// src/utils/promptValidation.ts
// Validates a free-text user prompt before it is sent to the
// recommendation / translation backend.
//
// Rules enforced:
//   1. Length: 3 .. 1000 characters (after trim)
//   2. Must contain at least 2 dictionary-shaped tokens (letters only,
//      length >= 2) OR a known scheme code (SC / ST / OBC / BPL / EWS / PWD).
//   3. Vowel ratio: real Latin words have ~30-55% vowels. Strings like
//      "eiluFGLEUFEAfvjeagfbi" or "asdfghjkl" fall outside [0.15, 0.75].
//   4. Max consecutive consonants <= 5 (English/Kannada transliteration
//      almost never exceeds 4-5 in a row).
//   5. Kannada (Unicode block U+0C80–U+0CFF) input is always accepted
//      provided it satisfies rule (1).
//
// Returns { ok: true } or { ok: false, reason: <i18n key>, message: <text> }.

export type PromptValidationResult =
  | { ok: true }
  | { ok: false; reason: PromptErrorCode; message: string; messageKn: string };

export type PromptErrorCode =
  | "EMPTY"
  | "TOO_SHORT"
  | "TOO_LONG"
  | "GIBBERISH";

export const PROMPT_MIN = 3;
export const PROMPT_MAX = 1000;

const SCHEME_CODES = new Set([
  "SC", "ST", "OBC", "BPL", "EWS", "PWD", "GEN",
]);

const VOWELS = new Set(["a", "e", "i", "o", "u"]);
const KANNADA_RE = /[\u0C80-\u0CFF]/;

function vowelRatio(s: string): number {
  const letters = s.toLowerCase().replace(/[^a-z]/g, "");
  if (letters.length === 0) return 1; // non-Latin: skip this check
  let v = 0;
  for (const ch of letters) if (VOWELS.has(ch)) v++;
  return v / letters.length;
}

function maxConsonantRun(s: string): number {
  const letters = s.toLowerCase().replace(/[^a-z]/g, "");
  let run = 0, best = 0;
  for (const ch of letters) {
    if (VOWELS.has(ch)) { run = 0; }
    else { run++; if (run > best) best = run; }
  }
  return best;
}

export function validatePrompt(raw: string): PromptValidationResult {
  const text = (raw ?? "").trim();

  if (text.length === 0) {
    return {
      ok: false,
      reason: "EMPTY",
      message: "Please describe what kind of scheme you are looking for.",
      messageKn: "ದಯವಿಟ್ಟು ನೀವು ಹುಡುಕುತ್ತಿರುವ ಯೋಜನೆಯ ಬಗ್ಗೆ ವಿವರಿಸಿ.",
    };
  }
  if (text.length < PROMPT_MIN) {
    return {
      ok: false,
      reason: "TOO_SHORT",
      message: `Prompt is too short (minimum ${PROMPT_MIN} characters).`,
      messageKn: `ಪ್ರಾಂಪ್ಟ್ ತುಂಬಾ ಚಿಕ್ಕದಾಗಿದೆ (ಕನಿಷ್ಠ ${PROMPT_MIN} ಅಕ್ಷರಗಳು).`,
    };
  }
  if (text.length > PROMPT_MAX) {
    return {
      ok: false,
      reason: "TOO_LONG",
      message: `Prompt is too long (maximum ${PROMPT_MAX} characters).`,
      messageKn: `ಪ್ರಾಂಪ್ಟ್ ತುಂಬಾ ಉದ್ದವಾಗಿದೆ (ಗರಿಷ್ಠ ${PROMPT_MAX} ಅಕ್ಷರಗಳು).`,
    };
  }

  // Kannada input bypasses Latin-shape checks.
  if (KANNADA_RE.test(text)) return { ok: true };

  // Token check
  const tokens = text.split(/\s+/).filter(Boolean);
  const goodTokens = tokens.filter(
    (t) => /^[A-Za-z]{2,}$/.test(t) || SCHEME_CODES.has(t.toUpperCase()),
  );
  if (goodTokens.length < 2 && !tokens.some((t) => SCHEME_CODES.has(t.toUpperCase()))) {
    return gibberish();
  }

  const ratio = vowelRatio(text);
  if (ratio < 0.15 || ratio > 0.75) return gibberish();

  if (maxConsonantRun(text) > 5) return gibberish();

  return { ok: true };
}

function gibberish(): PromptValidationResult {
  return {
    ok: false,
    reason: "GIBBERISH",
    message:
      "That doesn't look like a real query. Try something like \"scholarship for SC students\" or \"housing scheme for BPL families\".",
    messageKn:
      "ಅದು ನಿಜವಾದ ಪ್ರಶ್ನೆಯಂತೆ ಕಾಣುತ್ತಿಲ್ಲ. \"SC ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ವಿದ್ಯಾರ್ಥಿವೇತನ\" ಅಥವಾ \"BPL ಕುಟುಂಬಗಳಿಗೆ ವಸತಿ ಯೋಜನೆ\" ಎಂದು ಪ್ರಯತ್ನಿಸಿ.",
  };
}
