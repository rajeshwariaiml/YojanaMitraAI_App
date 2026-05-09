// src/components/SchemeCard.tsx
//
// Patched v2: routes ALL displayed strings through the aggressive
// localizeKannadaFallback() pipeline so no English fragment leaks
// inside the Kannada cards. Also keeps the Indian-flag tricolour styling.

import { Bookmark, BookmarkCheck, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatLocalizedDate } from "@/utils/dateFormatter";
import { useLanguage } from "@/context/LanguageContext";
import {
  translateState,
  translateExplanation,
  translateMissingCriterion,
  translateFreeText,
} from "@/lib/translateScheme";
import {
  KANNADA_RE,
  localizeKannadaFallback,
} from "@/lib/kannadaTranslator";

export interface SchemeResult {
  id: string;
  scheme_name: string;
  scheme_name_kn?: string;
  title_kn?: string;
  category?: string | null;
  category_kn?: string | null;
  target_group?: string | null;
  target_group_kn?: string | null;
  benefits?: string | null;
  benefits_kn?: string | null;
  description?: string | null;
  description_kn?: string | null;
  eligibility?: string | null;
  eligibility_kn?: string | null;
  deadline?: string | null;
  official_link?: string | null;
  state?: string | null;
  state_kn?: string | null;
  match_percentage: number;
  eligibility_status: "eligible" | "partial" | "not_eligible";
  missing_criteria?: string[];
  explanation?: string | null;
  explanation_kn?: string | null;
}

interface SchemeCardProps {
  scheme: SchemeResult;
  onSave?: (scheme: SchemeResult) => void;
  onApply?: (scheme: SchemeResult) => void;
  isSaved?: boolean;
}

const pickLocalized = (
  primary: string | null | undefined,
  fallback: string | null | undefined,
  lang: "en" | "kn",
) => {
  if (lang === "kn") {
    if (primary && primary.trim()) return primary;
    if (fallback && fallback.trim()) return fallback;
    return "";
  }
  if (primary && primary.trim()) return primary;
  if (fallback && fallback.trim()) return fallback;
  return "";
};

export function SchemeCard({ scheme, onSave, onApply, isSaved }: SchemeCardProps) {
  const { language, t } = useLanguage();
  const isKn = language === "kn";

  // Single funnel: every string the user sees in KN goes through this.
  const localize = (val: string | null | undefined): string => {
    const v = (val ?? "").toString();
    if (!isKn) return v;
    const pre = translateFreeText(v, "kn") || v;
    return localizeKannadaFallback(pre);
  };

  const rawName =
    pickLocalized(
      isKn ? (scheme.scheme_name_kn || scheme.title_kn) : scheme.scheme_name,
      scheme.scheme_name,
      language,
    ) || t("scheme_untitled");
  const name = localize(rawName);
  const nameIsKn = KANNADA_RE.test(name);

  const benefitsRaw =
    pickLocalized(isKn ? scheme.benefits_kn : scheme.benefits, scheme.benefits, language) || "";
  const benefits = localize(benefitsRaw);
  const benefitsIsKn = KANNADA_RE.test(benefits);

  const descriptionRaw =
    pickLocalized(isKn ? scheme.description_kn : scheme.description, scheme.description, language) || "";
  const description = localize(descriptionRaw);
  const descriptionIsKn = KANNADA_RE.test(description);

  const eligibilityRaw =
    pickLocalized(isKn ? scheme.eligibility_kn : scheme.eligibility, scheme.eligibility, language) || "";
  const eligibility = localize(eligibilityRaw);
  const eligibilityIsKn = KANNADA_RE.test(eligibility);

  const explanationRaw =
    pickLocalized(
      isKn ? scheme.explanation_kn : scheme.explanation,
      scheme.explanation,
      language,
    ) || "";
  const explanation = isKn
    ? localizeKannadaFallback(translateExplanation(explanationRaw, "kn") || explanationRaw)
    : explanationRaw;
  const explanationIsKn = KANNADA_RE.test(explanation);

  const missing = (scheme.missing_criteria ?? []).map((m) =>
    isKn ? localizeKannadaFallback(translateMissingCriterion(m, "kn") || m) : m,
  );

  const stateSource = pickLocalized(isKn ? scheme.state_kn : scheme.state, scheme.state, language);
  const categorySource = pickLocalized(isKn ? scheme.category_kn : scheme.category, scheme.category, language);
  const targetSource = pickLocalized(isKn ? scheme.target_group_kn : scheme.target_group, scheme.target_group, language);
  const stateLabel = stateSource ? localize(translateState(stateSource, language) || stateSource) : "";
  const categoryLabel = categorySource ? localize(categorySource) : "";
  const targetLabel = targetSource ? localize(targetSource) : "";
  const stateIsKn = KANNADA_RE.test(stateLabel);
  const categoryIsKn = KANNADA_RE.test(categoryLabel);
  const targetIsKn = KANNADA_RE.test(targetLabel);

  const pct = Math.max(0, Math.min(100, Math.round(scheme.match_percentage ?? 0)));

  const eligibilityLabel =
    scheme.eligibility_status === "eligible"
      ? t("scheme_eligible")
      : scheme.eligibility_status === "partial"
      ? t("scheme_partial")
      : t("scheme_not_eligible");

  const eligibilityClass =
    scheme.eligibility_status === "eligible"
      ? "bg-[hsl(120_82%_28%/0.12)] text-[hsl(120_82%_22%)] border-[hsl(120_82%_28%/0.4)]"
      : scheme.eligibility_status === "partial"
      ? "bg-[hsl(30_100%_60%/0.18)] text-[hsl(30_90%_30%)] border-[hsl(30_100%_60%/0.5)]"
      : "bg-red-50 text-red-700 border-red-200";

  const deadlineRaw = scheme.deadline
    ? formatLocalizedDate(scheme.deadline, language)
    : t("scheme_status_ongoing");
  const deadlineText = isKn ? localizeKannadaFallback(deadlineRaw) : deadlineRaw;

  const handleApply = () => {
    if (onApply) {
      onApply(scheme);
      return;
    }
    if (scheme.official_link) {
      window.open(scheme.official_link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card
      className="relative overflow-hidden p-6 space-y-4 border-2 border-transparent hover:border-[hsl(var(--tri-saffron)/0.4)] transition-colors shadow-sm hover:shadow-lg"
      data-scheme-card=""
      data-scheme-name={name}
    >
      <div className="tricolour-bar absolute inset-x-0 top-0 h-1" aria-hidden />

      <div className="flex items-start justify-between gap-4 pt-1">
        <h3
          className="font-display text-xl font-bold leading-tight"
          lang={nameIsKn ? "kn" : "en"}
        >
          {name}
        </h3>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold gradient-tricolour-text">{pct}%</div>
          <div className="text-xs text-muted-foreground">{t("scheme_match_pct")}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${eligibilityClass}`}
        >
          {eligibilityLabel}
        </span>
        {stateLabel && (
          <span
            className="inline-block text-xs font-medium px-2.5 py-1 rounded-full border bg-secondary/15 text-secondary-foreground border-secondary/40"
            lang={stateIsKn ? "kn" : "en"}
          >
            {stateLabel}
          </span>
        )}
        {categoryLabel && (
          <span
            className="inline-block text-xs font-medium px-2.5 py-1 rounded-full border bg-[hsl(var(--tri-green)/0.1)] text-[hsl(120_82%_22%)] border-[hsl(var(--tri-green)/0.3)]"
            lang={categoryIsKn ? "kn" : "en"}
          >
            {categoryLabel}
          </span>
        )}
        {targetLabel && (
          <span
            className="inline-block text-xs font-medium px-2.5 py-1 rounded-full border bg-[hsl(var(--tri-saffron)/0.12)] text-[hsl(30_90%_30%)] border-[hsl(var(--tri-saffron)/0.4)]"
            lang={targetIsKn ? "kn" : "en"}
          >
            {targetLabel}
          </span>
        )}
      </div>

      {benefits && (
        <p
          className="text-sm leading-relaxed"
          lang={benefitsIsKn ? "kn" : "en"}
        >
          {benefits}
        </p>
      )}

      {description && description !== benefits && (
        <p
          className="text-sm leading-relaxed text-muted-foreground"
          lang={descriptionIsKn ? "kn" : "en"}
        >
          {description}
        </p>
      )}

      {eligibility && (
        <p
          className="text-sm leading-relaxed"
          lang={eligibilityIsKn ? "kn" : "en"}
        >
          <span className="font-semibold">{t("eligibility_label")}</span> {eligibility}
        </p>
      )}

      {explanation && (
        <p
          className="text-sm leading-relaxed text-muted-foreground"
          lang={explanationIsKn ? "kn" : "en"}
        >
          {explanation}
        </p>
      )}

      {missing.length > 0 && (
        <div className="rounded-lg border border-[hsl(30_100%_60%/0.4)] bg-[hsl(30_100%_60%/0.06)] p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(30_100%_60%/0.2)] text-[hsl(30_90%_30%)] text-[11px] font-bold">
              !
            </span>
            <div className="text-xs font-semibold uppercase tracking-wide text-[hsl(30_90%_30%)]">
              {t("scheme missingcriteria")}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5" lang={KANNADA_RE.test(missing.join(" ")) ? "kn" : "en"}>
            {missing.map((m, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-background/70 px-2.5 py-1 text-xs font-medium text-[hsl(30_90%_28%)]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(30_100%_50%)]" aria-hidden />
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" aria-hidden />
        <span className="font-medium">{t("scheme_deadline")}</span>
        <span lang={KANNADA_RE.test(deadlineText) ? "kn" : "en"}>{deadlineText}</span>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          type="button"
          onClick={handleApply}
          className="gap-2 bg-[hsl(var(--tri-green))] hover:bg-[hsl(120_82%_24%)] text-white"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          <span>{t("scheme_apply")}</span>
        </Button>
        {onSave && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onSave(scheme)}
            className="gap-2 border-[hsl(var(--tri-saffron)/0.6)] text-[hsl(30_90%_30%)] hover:bg-[hsl(var(--tri-saffron)/0.12)]"
            aria-pressed={isSaved}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4" aria-hidden />
            ) : (
              <Bookmark className="h-4 w-4" aria-hidden />
            )}
            <span>{isSaved ? t("scheme_saved") : t("scheme_save")}</span>
          </Button>
        )}
      </div>
    </Card>
  );
}

export default SchemeCard;
