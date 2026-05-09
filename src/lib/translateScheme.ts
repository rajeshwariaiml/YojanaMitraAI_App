// Helpers for translating dataset values that are not in i18n dictionaries
// (categories, target groups, states, fallback explanations, missing-criteria sentences).

export type Lang = "en" | "kn";

const CATEGORY_KN: Record<string, string> = {
  education: "ಶಿಕ್ಷಣ",
  employment: "ಉದ್ಯೋಗ",
  health: "ಆರೋಗ್ಯ",
  healthcare: "ಆರೋಗ್ಯ",
  "women & child": "ಮಹಿಳೆ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ",
  "women & child development": "ಮಹಿಳೆ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ",
  "social welfare": "ಸಾಮಾಜಿಕ ಕಲ್ಯಾಣ",
  "financial inclusion": "ಆರ್ಥಿಕ ಒಳಗೊಳ್ಳಿಕೆ",
  "ಹಣಕಾಸು ಒಳಗೊಳ್ಳಿಕೆ": "ಆರ್ಥಿಕ ಒಳಗೊಳ್ಳಿಕೆ",
  entrepreneurship: "ಉದ್ಯಮಿತ್ವ",
  women: "ಮಹಿಳೆಯರು",
  youth: "ಯುವಕರು",
  agriculture: "ಕೃಷಿ",
  housing: "ವಸತಿ",
  finance: "ಹಣಕಾಸು",
  pension: "ಪಿಂಚಣಿ",
  scholarship: "ವಿದ್ಯಾರ್ಥಿವೇತನ",
  welfare: "ಕಲ್ಯಾಣ",
  insurance: "ವಿಮೆ",
  skill: "ಕೌಶಲ್ಯ",
  "skill development": "ಕೌಶಲ್ಯ ಅಭಿವೃದ್ಧಿ",
  social: "ಸಾಮಾಜಿಕ",
  rural: "ಗ್ರಾಮೀಣ",
  urban: "ನಗರ",
};

const TARGET_KN: Record<string, string> = {
  "all": "ಎಲ್ಲರೂ",
  "all citizens": "ಎಲ್ಲ ನಾಗರಿಕರು",
  "all indian citizens": "ಎಲ್ಲ ಭಾರತೀಯ ನಾಗರಿಕರು",
  "all indian residents": "ಎಲ್ಲ ಭಾರತೀಯ ನಿವಾಸಿಗಳು",
  "students": "ವಿದ್ಯಾರ್ಥಿಗಳು",
  "sc students": "SC ವಿದ್ಯಾರ್ಥಿಗಳು",
  "st students": "ST ವಿದ್ಯಾರ್ಥಿಗಳು",
  "obc students": "OBC ವಿದ್ಯಾರ್ಥಿಗಳು",
  "farmers": "ರೈತರು",
  "farmer families": "ರೈತ ಕುಟುಂಬಗಳು",
  "women": "ಮಹಿಳೆಯರು",
  "women & sc/st": "ಮಹಿಳೆಯರು ಮತ್ತು SC/ST ವರ್ಗಗಳು",
  "women & sc/st entrepreneurs": "ಮಹಿಳಾ ಮತ್ತು SC/ST ಉದ್ಯಮಿಗಳು",
  "youth": "ಯುವಕರು",
  "senior citizens": "ಹಿರಿಯ ನಾಗರಿಕರು",
  "minorities": "ಅಲ್ಪಸಂಖ್ಯಾತರು",
  "entrepreneurs": "ಉದ್ಯಮಿಗಳು",
  "small entrepreneurs": "ಸಣ್ಣ ಉದ್ಯಮಿಗಳು",
  "unemployed": "ನಿರುದ್ಯೋಗಿಗಳು",
  "general": "ಸಾಮಾನ್ಯ",
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
  "girl child under 10": "10 ವರ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ ವಯಸ್ಸಿನ ಹೆಣ್ಣು ಮಗು",
  "pregnant women": "ಗರ್ಭಿಣಿ ಮಹಿಳೆಯರು",
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
};

const STATE_KN: Record<string, string> = {
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
};

const lookup = (map: Record<string, string>, value?: string | null) => {
  if (!value) return value ?? "";
  const key = value.trim().toLowerCase();
  return map[key] ?? value;
};

const METADATA_KN: Record<string, string> = {
  ...CATEGORY_KN,
  ...TARGET_KN,
  ...STATE_KN,
  "ಹಣಕಾಸು ಒಳಗೊಳ್ಳಿಕೆ": "ಆರ್ಥಿಕ ಒಳಗೊಳ್ಳಿಕೆ",
  "financial inclusion": "ಆರ್ಥಿಕ ಒಳಗೊಳ್ಳಿಕೆ",
  "currently enrolled studies": "ಪ್ರಸ್ತುತ ಅಧ್ಯಯನದಲ್ಲಿರುವವರು",
  "stipend support": "ವಿದ್ಯಾರ್ಥಿವೇತನ ಸಹಾಯ",
  "sc/st/obc students": "SC/ST/OBC ವಿದ್ಯಾರ್ಥಿಗಳು",
  categories: "ವರ್ಗಗಳು",
  national: "ರಾಷ್ಟ್ರೀಯ",
  central: "ಕೇಂದ್ರ",
  state: "ರಾಜ್ಯ",
  regional: "ಪ್ರಾದೇಶಿಕ",
  rural: "ಗ್ರಾಮೀಣ",
  urban: "ನಗರ",
  individual: "ವೈಯಕ್ತಿಕ",
  family: "ಕುಟುಂಬ",
  loan: "ಸಾಲ",
  subsidy: "ಸಬ್ಸಿಡಿ",
  scholarship: "ವಿದ್ಯಾರ್ಥಿವೇತನ",
  pension: "ಪಿಂಚಣಿ",
  insurance: "ವಿಮೆ",
  welfare: "ಕಲ್ಯಾಣ",
  student: "ವಿದ್ಯಾರ್ಥಿ",
  farmer: "ರೈತ",
  "self-employed": "ಸ್ವಯಂ ಉದ್ಯೋಗಿ",
  salaried: "ವೇತನಭೋಗಿ",
  retired: "ನಿವೃತ್ತರು",
  homemaker: "ಗೃಹಿಣಿ",
  entrepreneur: "ಉದ್ಯಮಿ",
  "below 10th": "10ನೇ ತರಗತಿಗಿಂತ ಕಡಿಮೆ",
  "10th pass": "10ನೇ ತರಗತಿ ಪಾಸ್",
  "12th pass": "12ನೇ ತರಗತಿ ಪಾಸ್",
  graduate: "ಪದವೀಧರ",
  "post graduate": "ಸ್ನಾತಕೋತ್ತರ",
  phd: "ಪಿಎಚ್‌ಡಿ",
  "diploma/iti": "ಡಿಪ್ಲೊಮಾ/ಐಟಿಐ",
  sc: "SC",
  st: "ST",
  obc: "OBC",
  ews: "EWS",
  minority: "ಅಲ್ಪಸಂಖ್ಯಾತ",
};

export const translateCategory = (value: string | null | undefined, lang: Lang) =>
  lang === "kn" ? lookup(CATEGORY_KN, value) : (value ?? "");

export const translateTargetGroup = (value: string | null | undefined, lang: Lang) => {
  if (lang !== "kn") return value ?? "";
  if (!value) return "";
  const key = value.trim().toLowerCase();
  if (TARGET_KN[key]) return TARGET_KN[key];
  // Fall back to phrase-level translation so multi-word groups still convert.
  return phraseTranslate(value);
};

export const translateState = (value: string | null | undefined, lang: Lang) =>
  lang === "kn" ? lookup(STATE_KN, value) : (value ?? "");

export const translateMetadataValue = (value: string | number | null | undefined, lang: Lang) => {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (lang !== "kn") return text;
  const direct = lookup(METADATA_KN, text);
  return direct === text ? phraseTranslate(text) : direct;
};

export const translateMetadataList = (value: string[] | string | null | undefined, lang: Lang) => {
  if (!value) return value ?? undefined;
  if (Array.isArray(value)) return value.map((item) => translateMetadataValue(item, lang));
  return translateMetadataValue(value, lang);
};

// Translate a free-text fallback explanation produced by the local matcher
// Mapping of attribute names emitted by ml_pipeline/explainability_engine.py
const ATTRIBUTE_KN: Record<string, string> = {
  "age range": "ವಯಸ್ಸಿನ ವ್ಯಾಪ್ತಿ",
  "income level": "ಆದಾಯದ ಮಟ್ಟ",
  "geographic location": "ಭೌಗೋಳಿಕ ಸ್ಥಳ",
  "gender criteria": "ಲಿಂಗ ಮಾನದಂಡ",
  "education qualification": "ಶೈಕ್ಷಣಿಕ ಅರ್ಹತೆ",
  "occupation type": "ಉದ್ಯೋಗ ಪ್ರಕಾರ",
  "social category": "ಸಾಮಾಜಿಕ ವರ್ಗ",
};

const translateAttrList = (csv: string) =>
  csv.split(/,\s*|\s+and\s+/).map((a) => ATTRIBUTE_KN[a.trim().toLowerCase()] ?? a.trim()).join(", ");

// or the recommend-schemes edge function / ml_pipeline explainability engine.
export const translateExplanation = (text: string | undefined, lang: Lang) => {
  if (!text || lang !== "kn") return text ?? "";
  let out = text;

  // Edge-function fallback sentences
  out = out
    .replace(/Matched based on strong alignment with your age, income, and location profile\./i,
      "ನಿಮ್ಮ ವಯಸ್ಸು, ಆದಾಯ ಮತ್ತು ಸ್ಥಳಕ್ಕೆ ಬಲವಾದ ಹೊಂದಾಣಿಕೆಯ ಆಧಾರದಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ.")
    .replace(/Matched based on partial alignment with your age, income, and location profile\./i,
      "ನಿಮ್ಮ ವಯಸ್ಸು, ಆದಾಯ ಮತ್ತು ಸ್ಥಳಕ್ಕೆ ಭಾಗಶಃ ಹೊಂದಾಣಿಕೆಯ ಆಧಾರದಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ.")
    .replace(/Matched based on strong alignment with your demographic profile\./i,
      "ನಿಮ್ಮ ಜನಸಂಖ್ಯಾ ಪ್ರೊಫೈಲ್‌ಗೆ ಬಲವಾದ ಹೊಂದಾಣಿಕೆಯ ಆಧಾರದಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ.")
    .replace(/Matched based on partial alignment with your demographic profile\./i,
      "ನಿಮ್ಮ ಜನಸಂಖ್ಯಾ ಪ್ರೊಫೈಲ್‌ಗೆ ಭಾಗಶಃ ಹೊಂದಾಣಿಕೆಯ ಆಧಾರದಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ.");

  // ML pipeline (ExplainabilityEngine) template fragments
  out = out
    .replace(/This scheme is highly recommended for you\./i,
      "ಈ ಯೋಜನೆಯನ್ನು ನಿಮಗೆ ಬಲವಾಗಿ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.")
    .replace(/This scheme is a partial match for your profile\./i,
      "ಈ ಯೋಜನೆ ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗೆ ಭಾಗಶಃ ಹೊಂದಿಕೆಯಾಗಿದೆ.")
    .replace(/This scheme has limited alignment with your current profile\./i,
      "ಈ ಯೋಜನೆ ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಪ್ರೊಫೈಲ್‌ಗೆ ಸೀಮಿತ ಹೊಂದಾಣಿಕೆ ಹೊಂದಿದೆ.")
    .replace(/Your profile strongly aligns with the eligibility criteria\./i,
      "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಅರ್ಹತೆ ಮಾನದಂಡಗಳಿಗೆ ಬಲವಾಗಿ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.")
    .replace(/Consider updating your profile or checking if exceptions apply\./i,
      "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ ಅಥವಾ ವಿನಾಯಿತಿಗಳಿವೆಯೇ ಎಂಬುದನ್ನು ಪರಿಶೀಲಿಸಿ.")
    .replace(/You may become eligible if your circumstances change\./i,
      "ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿ ಬದಲಾದರೆ ನೀವು ಅರ್ಹರಾಗಬಹುದು.")
    .replace(/Limited profile information was available for matching\./i,
      "ಹೊಂದಾಣಿಕೆಗೆ ಸೀಮಿತ ಪ್ರೊಫೈಲ್ ಮಾಹಿತಿ ಲಭ್ಯವಿತ್ತು.")
    .replace(/However,\s*/i, "ಆದರೆ, ")
    .replace(/Missing criteria:\s*/i, "ಕೊರತೆಯಿರುವ ಮಾನದಂಡ: ");

  // "It matches your X." / "It matches your A, B and C."
  out = out.replace(/It matches your ([^.]+)\./gi, (_, attrs) =>
    `ಇದು ನಿಮ್ಮ ${translateAttrList(attrs)} ಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.`);

  return out;
};

// Word-level dictionary used for benefits / eligibility / criteria fallbacks
// when no *_kn variant is present in the dataset.
const PHRASE_KN: Array<[RegExp, string]> = [
  // ---- Order matters: longer / multi-word phrases first ----
  [/Women\s*&\s*SC\/ST entrepreneurs?/gi, "ಮಹಿಳಾ ಮತ್ತು SC/ST ಉದ್ಯಮಿಗಳು"],
  [/Women\s*&\s*SC\/ST/gi, "ಮಹಿಳೆಯರು ಮತ್ತು SC/ST ವರ್ಗಗಳು"],
  [/Financial Inclusion/gi, "ಆರ್ಥಿಕ ಒಳಗೊಳ್ಳಿಕೆ"],
  [/currently enrolled studies/gi, "ಪ್ರಸ್ತುತ ಅಧ್ಯಯನದಲ್ಲಿರುವವರು"],
  [/Stipend support/gi, "ವಿದ್ಯಾರ್ಥಿವೇತನ ಸಹಾಯ"],
  [/SC\/ST\/OBC Students/gi, "SC/ST/OBC ವಿದ್ಯಾರ್ಥಿಗಳು"],
  [/\bcategories\b/gi, "ವರ್ಗಗಳು"],
  [/Traditional Artisans/gi, "ಪಾರಂಪರಿಕ ಕುಶಲಕರ್ಮಿಗಳು"],
  [/All Indian residents/gi, "ಎಲ್ಲ ಭಾರತೀಯ ನಿವಾಸಿಗಳು"],
  [/All Indian citizens/gi, "ಎಲ್ಲ ಭಾರತೀಯ ನಾಗರಿಕರು"],
  [/All citizens/gi, "ಎಲ್ಲ ನಾಗರಿಕರು"],
  [/Target\s*:\s*SC\/ST categor(y|ies)/gi, "ಗುರಿ: SC/ST ವರ್ಗಗಳು"],
  [/Target\s*group\s*:\s*/gi, "ಗುರಿ ಗುಂಪು: "],
  [/Target\s*:\s*/gi, "ಗುರಿ: "],
  [/SC\/ST categor(y|ies)/gi, "SC/ST ವರ್ಗಗಳು"],
  [/Women & Child Development/gi, "ಮಹಿಳೆ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ"],
  [/Women & Child/gi, "ಮಹಿಳೆ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ"],
  [/Social Welfare/gi, "ಸಾಮಾಜಿಕ ಕಲ್ಯಾಣ"],
  [/Girl child under 10/gi, "10 ವರ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ ವಯಸ್ಸಿನ ಹೆಣ್ಣು ಮಗು"],
  [/Girl child/gi, "ಹೆಣ್ಣು ಮಗು"],
  [/Farmer families/gi, "ರೈತ ಕುಟುಂಬಗಳು"],
  [/Small entrepreneurs?/gi, "ಸಣ್ಣ ಉದ್ಯಮಿಗಳು"],
  [/Unorganised workers?/gi, "ಅಸಂಘಟಿತ ಕಾರ್ಮಿಕರು"],
  [/Pregnant women/gi, "ಗರ್ಭಿಣಿ ಮಹಿಳೆಯರು"],
  [/Senior citizens/gi, "ಹಿರಿಯ ನಾಗರಿಕರು"],
  [/Disabled persons/gi, "ಅಂಗವಿಕಲ ವ್ಯಕ್ತಿಗಳು"],
  [/Disabled students/gi, "ಅಂಗವಿಕಲ ವಿದ್ಯಾರ್ಥಿಗಳು"],
  [/School children/gi, "ಶಾಲಾ ಮಕ್ಕಳು"],
  [/School students/gi, "ಶಾಲಾ ವಿದ್ಯಾರ್ಥಿಗಳು"],
  [/Class 9-12 students/gi, "9-12ನೇ ತರಗತಿ ವಿದ್ಯಾರ್ಥಿಗಳು"],
  [/Girl students/gi, "ವಿದ್ಯಾರ್ಥಿನಿಯರು"],
  [/Science students/gi, "ವಿಜ್ಞಾನ ವಿದ್ಯಾರ್ಥಿಗಳು"],
  [/Adults 18-50/gi, "18-50 ವಯಸ್ಸಿನ ವಯಸ್ಕರು"],
  [/Adults 18-65/gi, "18-65 ವಯಸ್ಸಿನ ವಯಸ್ಕರು"],
  [/Adults 18-70/gi, "18-70 ವಯಸ್ಸಿನ ವಯಸ್ಕರು"],
  [/Must belong to BPL category/gi, "BPL ವರ್ಗಕ್ಕೆ ಸೇರಿರಬೇಕು"],
  [/Must belong to APL category/gi, "APL ವರ್ಗಕ್ಕೆ ಸೇರಿರಬೇಕು"],
  [/Below Poverty Line/gi, "ಬಡತನ ರೇಖೆಗಿಂತ ಕೆಳಗೆ"],
  [/Above Poverty Line/gi, "ಬಡತನ ರೇಖೆಗಿಂತ ಮೇಲೆ"],
  [/Annual income/gi, "ವಾರ್ಷಿಕ ಆದಾಯ"],
  [/Family income/gi, "ಕುಟುಂಬದ ಆದಾಯ"],
  [/Must be a resident of/gi, "ನಿವಾಸಿ ಆಗಿರಬೇಕು"],
  [/Must be a citizen of India/gi, "ಭಾರತದ ಪ್ರಜೆಯಾಗಿರಬೇಕು"],
  [/Must be a citizen/gi, "ಪ್ರಜೆಯಾಗಿರಬೇಕು"],
  [/Must be a student/gi, "ವಿದ್ಯಾರ್ಥಿಯಾಗಿರಬೇಕು"],
  [/Must be a farmer/gi, "ರೈತನಾಗಿರಬೇಕು"],
  [/Must be unemployed/gi, "ನಿರುದ್ಯೋಗಿಯಾಗಿರಬೇಕು"],
  [/Must be married/gi, "ವಿವಾಹಿತರಾಗಿರಬೇಕು"],
  [/Must be unmarried/gi, "ಅವಿವಾಹಿತರಾಗಿರಬೇಕು"],

  // ---- Loan / credit / business benefit phrases (covers Mudra etc.) ----
  [/Collateral[- ]free loan(s)?/gi, "ಖಾತರಿ ರಹಿತ ಸಾಲ"],
  [/Collateral[- ]free/gi, "ಖಾತರಿ ರಹಿತ"],
  [/Credit (facility|support|guarantee)/gi, "ಸಾಲ ಸೌಲಭ್ಯ"],
  [/Working capital/gi, "ಚಲಾವಣಾ ಬಂಡವಾಳ"],
  [/Term loan/gi, "ಅವಧಿ ಸಾಲ"],
  [/Micro,?\s*small (and|&) medium enterprises?/gi, "ಸೂಕ್ಷ್ಮ, ಸಣ್ಣ ಮತ್ತು ಮಧ್ಯಮ ಉದ್ಯಮಗಳು"],
  [/\bMSMEs?\b/g, "ಸೂಕ್ಷ್ಮ, ಸಣ್ಣ ಮತ್ತು ಮಧ್ಯಮ ಉದ್ಯಮ"],
  [/Small business(es)?/gi, "ಸಣ್ಣ ವ್ಯಾಪಾರ"],
  [/Business(es)?/gi, "ವ್ಯಾಪಾರ"],
  [/Micro enterprises?/gi, "ಸೂಕ್ಷ್ಮ ಉದ್ಯಮ"],
  [/Self[- ]employment/gi, "ಸ್ವಯಂ ಉದ್ಯೋಗ"],
  [/Self[- ]employed/gi, "ಸ್ವಯಂ ಉದ್ಯೋಗಿ"],
  [/Non[- ]corporate/gi, "ಕಾರ್ಪೊರೇಟ್ ಅಲ್ಲದ"],
  [/Non[- ]farm/gi, "ಕೃಷಿಯೇತರ"],
  [/Income generating activit(y|ies)/gi, "ಆದಾಯ ಗಳಿಕೆಯ ಚಟುವಟಿಕೆ"],
  [/Manufacturing/gi, "ಉತ್ಪಾದನೆ"],
  [/Trading/gi, "ವ್ಯಾಪಾರ"],
  [/Services? sector/gi, "ಸೇವಾ ವಲಯ"],
  [/Women entrepreneurs?/gi, "ಮಹಿಳಾ ಉದ್ಯಮಿಗಳು"],
  [/Entrepreneurs?/gi, "ಉದ್ಯಮಿಗಳು"],
  [/Artisans?/gi, "ಕುಶಲಕರ್ಮಿಗಳು"],
  [/Interest subsidy/gi, "ಬಡ್ಡಿ ಸಬ್ಸಿಡಿ"],
  [/Subsidi(z|s)ed interest/gi, "ಸಬ್ಸಿಡಿ ಬಡ್ಡಿ"],
  [/\binterest\b/gi, "ಬಡ್ಡಿ"],
  [/\bcollateral\b/gi, "ಖಾತರಿ"],
  [/\bcredit\b/gi, "ಸಾಲ"],
  [/loans? up to/gi, "ಗರಿಷ್ಠ ಸಾಲ"],

  // ---- Title words and scheme naming ----
  [/\bMudra\b/gi, "ಮುದ್ರಾ"],
  [/\bShishu\b/gi, "ಶಿಶು"],
  [/\bKishore\b/gi, "ಕಿಶೋರ್"],
  [/\bTarun\b/gi, "ತರುಣ"],
  [/\bYojana\b/gi, "ಯೋಜನೆ"],
  [/\bScheme\b/gi, "ಯೋಜನೆ"],

  // ---- Generic benefit / scheme nouns ----
  [/Financial assistance/gi, "ಆರ್ಥಿಕ ಸಹಾಯ"],
  [/Government support/gi, "ಸರ್ಕಾರಿ ಬೆಂಬಲ"],
  [/Government scheme/gi, "ಸರ್ಕಾರಿ ಯೋಜನೆ"],
  [/Employment/gi, "ಉದ್ಯೋಗ"],
  [/Education/gi, "ಶಿಕ್ಷಣ"],
  [/Agriculture/gi, "ಕೃಷಿ"],
  [/Healthcare/gi, "ಆರೋಗ್ಯ"],
  [/Health/gi, "ಆರೋಗ್ಯ"],
  [/Housing/gi, "ವಸತಿ"],
  [/Women/gi, "ಮಹಿಳೆಯರು"],
  [/Youth/gi, "ಯುವಕರು"],
  [/Farmers?/gi, "ರೈತರು"],
  [/Students?/gi, "ವಿದ್ಯಾರ್ಥಿಗಳು"],
  [/Families/gi, "ಕುಟುಂಬಗಳು"],
  [/Citizens/gi, "ನಾಗರಿಕರು"],
  [/Health insurance/gi, "ಆರೋಗ್ಯ ವಿಮೆ"],
  [/Insurance cover(age)?/gi, "ವಿಮಾ ರಕ್ಷಣೆ"],
  [/Pension/gi, "ಪಿಂಚಣಿ"],
  [/Scholarship/gi, "ವಿದ್ಯಾರ್ಥಿವೇತನ"],
  [/Subsidies/gi, "ಸಬ್ಸಿಡಿಗಳು"],
  [/Subsidy/gi, "ಸಬ್ಸಿಡಿ"],
  [/Welfare benefits?/gi, "ಕಲ್ಯಾಣ ಸೌಲಭ್ಯ"],
  [/Cash transfer/gi, "ನಗದು ವರ್ಗಾವಣೆ"],
  [/Direct benefit transfer/gi, "ನೇರ ಸೌಲಭ್ಯ ವರ್ಗಾವಣೆ"],
  [/Skill (training|development)/gi, "ಕೌಶಲ್ಯ ತರಬೇತಿ"],
  [/Training programme?/gi, "ತರಬೇತಿ ಕಾರ್ಯಕ್ರಮ"],
  [/Loan/gi, "ಸಾಲ"],

  // ---- Common time / amount tokens ----
  [/per year/gi, "ಪ್ರತಿ ವರ್ಷ"],
  [/per month/gi, "ಪ್ರತಿ ತಿಂಗಳು"],
  [/per family/gi, "ಪ್ರತಿ ಕುಟುಂಬ"],
  [/per annum/gi, "ಪ್ರತಿ ವರ್ಷ"],
  [/per beneficiary/gi, "ಪ್ರತಿ ಫಲಾನುಭವಿ"],
  [/up to ₹/gi, "ಗರಿಷ್ಠ ₹"],
  [/up to/gi, "ಗರಿಷ್ಠ"],
  [/lakhs?/gi, "ಲಕ್ಷ"],
  [/crores?/gi, "ಕೋಟಿ"],
  [/years/gi, "ವರ್ಷಗಳು"],
  [/year/gi, "ವರ್ಷ"],
  [/months?/gi, "ತಿಂಗಳು"],
  [/and above/gi, "ಮತ್ತು ಮೇಲೆ"],
  [/and below/gi, "ಮತ್ತು ಕೆಳಗೆ"],

  // ---- Labels emitted by local rule-based matcher ----
  [/Eligible:/gi, "ಅರ್ಹತೆ:"],
  [/Not eligible:/gi, "ಅರ್ಹರಲ್ಲ:"],

  // ---- Common short words (kept last; small risk of partial overlap) ----
  [/\ball india\b/gi, "ಅಖಿಲ ಭಾರತ"],
  [/Karnataka/g, "ಕರ್ನಾಟಕ"],
  [/\bIndia\b/g, "ಭಾರತ"],
];

const phraseTranslate = (text: string) => {
  let out = text;
  for (const [re, kn] of PHRASE_KN) out = out.replace(re, kn);
  return out;
};

// Translate a single "missing criterion" sentence emitted by the local matcher.
export const translateMissingCriterion = (text: string, lang: Lang) => {
  if (lang !== "kn") return text;
  const out = text
    .replace(/^Age must be (\d+)-(\d+)$/i, "ವಯಸ್ಸು $1-$2 ಆಗಿರಬೇಕು")
    .replace(/^Income must be under ₹([\d,]+)$/i, "ಆದಾಯ ₹$1 ಗಿಂತ ಕಡಿಮೆ ಇರಬೇಕು")
    .replace(/^Must be from (.+)$/i, (_, s) => `${lookup(STATE_KN, s)} ನಿವಾಸಿ ಆಗಿರಬೇಕು`)
    .replace(/^(.+) applicants only$/i, (_, g) => `ಕೇವಲ ${g === "Female" ? "ಮಹಿಳೆಯರು" : g === "Male" ? "ಪುರುಷರು" : g} ಮಾತ್ರ`);
  return phraseTranslate(out);
};

// Translate free-text benefits / eligibility / description when a *_kn
// variant is not available in the dataset.
export const translateFreeText = (text: string | undefined | null, lang: Lang) => {
  if (!text || lang !== "kn") return text ?? "";
  return phraseTranslate(text);
};
