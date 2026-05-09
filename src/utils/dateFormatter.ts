type Language = "en" | "kn";

const KANNADA_MONTHS = [
  "ಜನವರಿ",
  "ಫೆಬ್ರವರಿ",
  "ಮಾರ್ಚ್",
  "ಏಪ್ರಿಲ್",
  "ಮೇ",
  "ಜೂನ್",
  "ಜುಲೈ",
  "ಆಗಸ್ಟ್",
  "ಸೆಪ್ಟೆಂಬರ್",
  "ಅಕ್ಟೋಬರ್",
  "ನವೆಂಬರ್",
  "ಡಿಸೆಂಬರ್",
];

const ENGLISH_MONTHS: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

const parseDeadline = (value?: string | null) => {
  if (!value) return null;
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/);
  if (iso) return { year: iso[1], month: Number(iso[2]) - 1, day: Number(iso[3]) };

  const named = value.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (named) {
    const month = ENGLISH_MONTHS[named[1].toLowerCase()];
    if (month !== undefined) return { year: named[3], month, day: Number(named[2]) };
  }

  return null;
};

export const formatSchemeDeadline = (value?: string | null, language: Language = "en") => {
  const parsed = parseDeadline(value);
  if (!parsed) return value ?? "";
  if (language === "kn") return `${parsed.day} ${KANNADA_MONTHS[parsed.month]} ${parsed.year}`;
  return new Date(Number(parsed.year), parsed.month, parsed.day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
// Backwards-compatible alias used by SchemeCard.tsx (and any other callers
// that import `formatLocalizedDate`). Same behavior as `formatSchemeDeadline`.
export const formatLocalizedDate = formatSchemeDeadline;
