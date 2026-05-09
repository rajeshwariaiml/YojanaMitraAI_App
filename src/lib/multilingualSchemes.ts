// Build lookups of multilingual scheme data keyed by exact scheme_name first,
// then by normalized names/titles as a resilient fallback. The dataset ships
// with the frontend so we can enrich recommendation/saved/history records
// client-side without backend changes.
import dataset from "../../dataset/schemes_multilingual.json";

interface MultilingualScheme {
  scheme_name: string;
  title_en?: string;
  title_kn?: string;
  description_en?: string;
  description_kn?: string;
  benefits_en?: string;
  benefits_kn?: string;
  eligibility_en?: string;
  eligibility_kn?: string;
  criteria_en?: string[] | string;
  criteria_kn?: string[] | string;
  category_en?: string;
  category_kn?: string;
  state_en?: string;
  state_kn?: string;
  target_group_en?: string;
  target_group_kn?: string;
  keywords_en?: string[] | string;
  keywords_kn?: string[] | string;
  tags_en?: string[] | string;
  tags_kn?: string[] | string;
  beneficiary_labels_en?: string[] | string;
  beneficiary_labels_kn?: string[] | string;
  audience_en?: string;
  audience_kn?: string;
  scope_en?: string;
  scope_kn?: string;
  scheme_type_en?: string;
  scheme_type_kn?: string;
  region_en?: string;
  region_kn?: string;
}

const exact = (s: string) => s.trim();
const norm = (s: string) => s.trim().toLowerCase();

const EXACT_LOOKUP: Map<string, MultilingualScheme> = (() => {
  const m = new Map<string, MultilingualScheme>();
  for (const item of dataset as MultilingualScheme[]) {
    if (item.scheme_name) m.set(exact(item.scheme_name), item);
  }
  return m;
})();

const LOOKUP: Map<string, MultilingualScheme> = (() => {
  const m = new Map<string, MultilingualScheme>();
  for (const item of dataset as MultilingualScheme[]) {
    if (item.scheme_name) m.set(norm(item.scheme_name), item);
    if (item.title_en) m.set(norm(item.title_en), item);
  }
  return m;
})();

export interface MultilingualFields {
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
  category?: string;
  category_en?: string;
  category_kn?: string;
  state?: string | null;
  state_en?: string | null;
  state_kn?: string | null;
  target_group?: string;
  target_group_en?: string;
  target_group_kn?: string;
  keywords?: string[] | string;
  keywords_en?: string[] | string;
  keywords_kn?: string[] | string;
  tags?: string[] | string;
  tags_en?: string[] | string;
  tags_kn?: string[] | string;
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
}

/**
 * Merge multilingual fields from the local dataset into a scheme record.
 * Existing fields on the input always take precedence over dataset values.
 */
export const enrichWithMultilingual = <T extends { scheme_name?: string; title?: string } & MultilingualFields>(
  scheme: T,
): T => {
  if (!scheme?.scheme_name && !scheme?.title) return scheme;

  const match = (scheme.scheme_name && EXACT_LOOKUP.get(exact(scheme.scheme_name)))
    || (scheme.scheme_name && LOOKUP.get(norm(scheme.scheme_name)))
    || (scheme.title && LOOKUP.get(norm(scheme.title)));

  if (!match) return scheme;

  return {
    ...scheme,
    title_en: scheme.title_en ?? match.title_en,
    title_kn: scheme.title_kn ?? match.title_kn,
    description_en: scheme.description_en ?? match.description_en,
    description_kn: scheme.description_kn ?? match.description_kn,
    benefits_en: scheme.benefits_en ?? match.benefits_en,
    benefits_kn: scheme.benefits_kn ?? match.benefits_kn,
    eligibility_en: scheme.eligibility_en ?? match.eligibility_en,
    eligibility_kn: scheme.eligibility_kn ?? match.eligibility_kn,
    criteria_en: scheme.criteria_en ?? match.criteria_en,
    criteria_kn: scheme.criteria_kn ?? match.criteria_kn,
    category_en: scheme.category_en ?? match.category_en,
    category_kn: scheme.category_kn ?? match.category_kn,
    state_en: scheme.state_en ?? match.state_en,
    state_kn: scheme.state_kn ?? match.state_kn,
    target_group_en: scheme.target_group_en ?? match.target_group_en,
    target_group_kn: scheme.target_group_kn ?? match.target_group_kn,
    keywords_en: scheme.keywords_en ?? match.keywords_en,
    keywords_kn: scheme.keywords_kn ?? match.keywords_kn,
    tags_en: scheme.tags_en ?? match.tags_en,
    tags_kn: scheme.tags_kn ?? match.tags_kn,
    beneficiary_labels_en: scheme.beneficiary_labels_en ?? match.beneficiary_labels_en,
    beneficiary_labels_kn: scheme.beneficiary_labels_kn ?? match.beneficiary_labels_kn,
    audience_en: scheme.audience_en ?? match.audience_en,
    audience_kn: scheme.audience_kn ?? match.audience_kn,
    scope_en: scheme.scope_en ?? match.scope_en,
    scope_kn: scheme.scope_kn ?? match.scope_kn,
    scheme_type_en: scheme.scheme_type_en ?? match.scheme_type_en,
    scheme_type_kn: scheme.scheme_type_kn ?? match.scheme_type_kn,
    region_en: scheme.region_en ?? match.region_en,
    region_kn: scheme.region_kn ?? match.region_kn,
  };
};
