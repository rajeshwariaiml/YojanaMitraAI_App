import { enrichWithMultilingual } from "@/lib/multilingualSchemes";
import { localizeKannadaFallback } from "@/lib/kannadaTranslator";
import {
  translateCategory,
  translateExplanation,
  translateFreeText,
  translateMetadataList,
  translateMetadataValue,
  translateState,
  translateTargetGroup,
  type Lang,
} from "@/lib/translateScheme";

type MaybeText = string | null | undefined;
type MaybeList = string[] | string | null | undefined;

export interface LocalizableScheme {
  scheme_name?: string;
  scheme_name_en?: string;
  scheme_name_kn?: string;
  title?: string;
  title_en?: string;
  title_kn?: string;
  description?: string;
  description_en?: string;
  description_kn?: string;
  benefits?: string;
  benefits_en?: string;
  benefits_kn?: string;
  eligibility?: string;
  eligibility_en?: string;
  eligibility_kn?: string;
  explanation?: string;
  explanation_en?: string;
  explanation_kn?: string;
  criteria?: string[] | string;
  criteria_en?: string[] | string;
  criteria_kn?: string[] | string;
  target_group?: string;
  target_group_en?: string;
  target_group_kn?: string;
  category?: string;
  category_en?: string;
  category_kn?: string;
  state?: string | null;
  state_en?: string | null;
  state_kn?: string | null;
  tags?: string[] | string;
  tags_en?: string[] | string;
  tags_kn?: string[] | string;
  keywords?: string[] | string;
  keywords_en?: string[] | string;
  keywords_kn?: string[] | string;
  beneficiary_labels?: string[] | string;
  beneficiary_labels_en?: string[] | string;
  beneficiary_labels_kn?: string[] | string;
  audience?: string;
  audience_en?: string;
  audience_kn?: string;
  scope?: string;
  scope_en?: string;
  scope_kn?: string;
  scheme_type?: string;
  scheme_type_en?: string;
  scheme_type_kn?: string;
  region?: string;
  region_en?: string;
  region_kn?: string;
  deadline?: string | null;
}

const toKannada = (value?: MaybeText) => {
  const text = value?.trim();
  if (!text) return "";
  return localizeKannadaFallback(translateFreeText(text, "kn") || text);
};

const localizeText = (
  language: Lang,
  options: {
    kn?: MaybeText;
    en?: MaybeText;
    raw?: MaybeText;
    fallbackTransform?: (value: string, language: Lang) => string;
  },
) => {
  if (language !== "kn") return options.en ?? options.raw ?? "";

  const knValue = options.kn?.trim();
  if (knValue) return toKannada(knValue);

  const source = (options.en ?? options.raw ?? "").trim();
  if (!source) return "";
  const transformed = options.fallbackTransform ? options.fallbackTransform(source, "kn") : source;
  return toKannada(transformed);
};

const localizeList = (language: Lang, value: MaybeList, translator?: (value: string, lang: Lang) => string): MaybeList => {
  if (!value) return value ?? undefined;
  if (Array.isArray(value)) {
    return value.map((item) => localizeText(language, { raw: translator ? translator(item, language) : item }));
  }
  return localizeText(language, { raw: translator ? translator(value, language) : value });
};

export const localizeSchemeObject = <T extends LocalizableScheme>(scheme: T, language: Lang) => {
  const enriched = enrichWithMultilingual(scheme);

  const rawTitle = enriched.title_en ?? enriched.scheme_name_en ?? enriched.title ?? enriched.scheme_name ?? "";
  const titleKn = enriched.title_kn ?? enriched.scheme_name_kn ?? (rawTitle ? toKannada(rawTitle) : undefined);
  const descriptionKn = enriched.description_kn ?? (enriched.description_en || enriched.description ? toKannada(enriched.description_en ?? enriched.description) : undefined);
  const benefitsKn = enriched.benefits_kn ?? (enriched.benefits_en || enriched.benefits ? toKannada(enriched.benefits_en ?? enriched.benefits) : undefined);
  const eligibilityKn = enriched.eligibility_kn ?? (enriched.eligibility_en || enriched.eligibility ? toKannada(enriched.eligibility_en ?? enriched.eligibility) : undefined);
  const explanationSource = enriched.explanation_en ?? enriched.explanation;
  const explanationKn = enriched.explanation_kn ?? (explanationSource ? toKannada(translateExplanation(explanationSource, "kn")) : undefined);
  const criteriaKn = enriched.criteria_kn ?? localizeList(language, enriched.criteria_en ?? enriched.criteria, translateFreeText);
  const targetGroupKn = enriched.target_group_kn ?? (enriched.target_group_en || enriched.target_group ? toKannada(translateTargetGroup(enriched.target_group_en ?? enriched.target_group, "kn")) : undefined);
  const categoryKn = enriched.category_kn ?? (enriched.category_en || enriched.category ? toKannada(translateCategory(enriched.category_en ?? enriched.category, "kn")) : undefined);
  const stateKn = enriched.state_kn ?? (enriched.state_en || enriched.state ? toKannada(translateState(enriched.state_en ?? enriched.state, "kn")) : undefined);
  const keywordsKn = enriched.keywords_kn ?? translateMetadataList(enriched.keywords_en ?? enriched.keywords, "kn");
  const tagsKn = enriched.tags_kn ?? translateMetadataList(enriched.tags_en ?? enriched.tags, "kn");
  const beneficiaryLabelsKn = enriched.beneficiary_labels_kn ?? translateMetadataList(enriched.beneficiary_labels_en ?? enriched.beneficiary_labels, "kn");
  const audienceKn = enriched.audience_kn ?? (enriched.audience_en || enriched.audience ? translateMetadataValue(enriched.audience_en ?? enriched.audience, "kn") : undefined);
  const scopeKn = enriched.scope_kn ?? (enriched.scope_en || enriched.scope ? translateMetadataValue(enriched.scope_en ?? enriched.scope, "kn") : undefined);
  const schemeTypeKn = enriched.scheme_type_kn ?? (enriched.scheme_type_en || enriched.scheme_type ? translateMetadataValue(enriched.scheme_type_en ?? enriched.scheme_type, "kn") : undefined);
  const regionKn = enriched.region_kn ?? (enriched.region_en || enriched.region ? translateMetadataValue(enriched.region_en ?? enriched.region, "kn") : undefined);

  return {
    ...enriched,
    scheme_name_kn: titleKn,
    title_kn: titleKn,
    description_kn: descriptionKn,
    benefits_kn: benefitsKn,
    eligibility_kn: eligibilityKn,
    explanation_kn: explanationKn,
    criteria_kn: criteriaKn,
    target_group_kn: targetGroupKn,
    category_kn: categoryKn,
    state_kn: stateKn,
    keywords_kn: keywordsKn,
    tags_kn: tagsKn,
    beneficiary_labels_kn: beneficiaryLabelsKn,
    audience_kn: audienceKn,
    scope_kn: scopeKn,
    scheme_type_kn: schemeTypeKn,
    region_kn: regionKn,
    scheme_name: language === "kn" ? toKannada(titleKn || rawTitle) : rawTitle,
    title: language === "kn" ? toKannada(titleKn || rawTitle) : rawTitle,
    description: localizeText(language, { kn: descriptionKn, en: enriched.description_en, raw: enriched.description }),
    benefits: localizeText(language, { kn: benefitsKn, en: enriched.benefits_en, raw: enriched.benefits }),
    eligibility: localizeText(language, { kn: eligibilityKn, en: enriched.eligibility_en, raw: enriched.eligibility }),
    explanation: language === "kn" ? toKannada(explanationKn || explanationSource || "") : (enriched.explanation_en ?? enriched.explanation ?? ""),
    criteria: language === "kn" ? (criteriaKn ?? undefined) : (enriched.criteria_en ?? enriched.criteria ?? undefined),
    target_group: language === "kn" ? toKannada(targetGroupKn || "") : (enriched.target_group_en ?? enriched.target_group ?? ""),
    category: language === "kn" ? toKannada(categoryKn || "") : (enriched.category_en ?? enriched.category ?? ""),
    state: language === "kn" ? toKannada(stateKn || "") : (enriched.state_en ?? enriched.state ?? ""),
    keywords: language === "kn" ? keywordsKn : (enriched.keywords_en ?? enriched.keywords),
    tags: language === "kn" ? tagsKn : (enriched.tags_en ?? enriched.tags),
    beneficiary_labels: language === "kn" ? beneficiaryLabelsKn : (enriched.beneficiary_labels_en ?? enriched.beneficiary_labels),
    audience: language === "kn" ? toKannada(audienceKn || "") : (enriched.audience_en ?? enriched.audience ?? ""),
    scope: language === "kn" ? toKannada(scopeKn || "") : (enriched.scope_en ?? enriched.scope ?? ""),
    scheme_type: language === "kn" ? toKannada(schemeTypeKn || "") : (enriched.scheme_type_en ?? enriched.scheme_type ?? ""),
    region: language === "kn" ? toKannada(regionKn || "") : (enriched.region_en ?? enriched.region ?? ""),
    deadline_label: language === "kn" ? "ನಡೆಯುತ್ತಿದೆ" : "Ongoing",
  };
};
