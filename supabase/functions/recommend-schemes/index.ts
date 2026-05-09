import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KN_META: Record<string, string> = {
  "all": "ಎಲ್ಲರೂ",
  "all india": "ಅಖಿಲ ಭಾರತ",
  "agriculture": "ಕೃಷಿ",
  "education": "ಶಿಕ್ಷಣ",
  "employment": "ಉದ್ಯೋಗ",
  "health": "ಆರೋಗ್ಯ",
  "healthcare": "ಆರೋಗ್ಯ",
  "housing": "ವಸತಿ",
  "finance": "ಹಣಕಾಸು",
  "financial inclusion": "ಆರ್ಥಿಕ ಒಳಗೊಳ್ಳಿಕೆ",
  "women & child": "ಮಹಿಳೆ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ",
  "women & child development": "ಮಹಿಳೆ ಮತ್ತು ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ",
  "social welfare": "ಸಾಮಾಜಿಕ ಕಲ್ಯಾಣ",
  "entrepreneurship": "ಉದ್ಯಮಿತ್ವ",
  "skill development": "ಕೌಶಲ್ಯ ಅಭಿವೃದ್ಧಿ",
  "farmers": "ರೈತರು",
  "farmer families": "ರೈತ ಕುಟುಂಬಗಳು",
  "students": "ವಿದ್ಯಾರ್ಥಿಗಳು",
  "sc students": "ಎಸ್‌ಸಿ ವಿದ್ಯಾರ್ಥಿಗಳು",
  "st students": "ಎಸ್‌ಟಿ ವಿದ್ಯಾರ್ಥಿಗಳು",
  "obc students": "ಒಬಿಸಿ ವಿದ್ಯಾರ್ಥಿಗಳು",
  "women": "ಮಹಿಳೆಯರು",
  "women & sc/st entrepreneurs": "ಮಹಿಳಾ ಮತ್ತು ಎಸ್‌ಸಿ/ಎಸ್‌ಟಿ ಉದ್ಯಮಿಗಳು",
  "girls": "ಹುಡುಗಿಯರು",
  "girl child": "ಹೆಣ್ಣು ಮಗು",
  "girl child under 10": "10 ವರ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ ವಯಸ್ಸಿನ ಹೆಣ್ಣು ಮಗು",
  "bpl families": "ಬಿಪಿಎಲ್ ಕುಟುಂಬಗಳು",
  "urban poor": "ನಗರ ಬಡವರು",
  "rural poor": "ಗ್ರಾಮೀಣ ಬಡವರು",
  "artisans": "ಕುಶಲಕರ್ಮಿಗಳು",
  "small entrepreneurs": "ಸಣ್ಣ ಉದ್ಯಮಿಗಳು",
  "entrepreneurs": "ಉದ್ಯಮಿಗಳು",
  "unorganised workers": "ಅಸಂಘಟಿತ ಕಾರ್ಮಿಕರು",
  "all citizens": "ಎಲ್ಲ ನಾಗರಿಕರು",
  "senior citizens": "ಹಿರಿಯ ನಾಗರಿಕರು",
  "widows": "ವಿಧವೆಯರು",
  "disabled persons": "ಅಂಗವಿಕಲ ವ್ಯಕ್ತಿಗಳು",
  "pregnant women": "ಗರ್ಭಿಣಿ ಮಹಿಳೆಯರು",
  "youth": "ಯುವಕರು",
  "minorities": "ಅಲ್ಪಸಂಖ್ಯಾತರು",
  "general": "ಸಾಮಾನ್ಯ",
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

const KN_NAMES: Record<string, string> = {
  "pm kisan samman nidhi": "ಪಿಎಂ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ",
  "ayushman bharat - pmjay": "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ - ಪಿಎಂಜೆಎವೈ",
  "ayushman bharat - pm jan arogya yojana": "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ - ಪಿಎಂ ಜನ ಆರೋಗ್ಯ ಯೋಜನೆ",
  "pm awas yojana - urban": "ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆ - ನಗರ",
  "pm awas yojana (urban)": "ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆ (ನಗರ)",
  "pm awas yojana (rural)": "ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆ (ಗ್ರಾಮೀಣ)",
  "pm awas yojana": "ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆ",
  "mudra loan yojana": "ಮುದ್ರಾ ಸಾಲ ಯೋಜನೆ",
  "mudra yojana (shishu)": "ಮುದ್ರಾ ಯೋಜನೆ (ಶಿಶು)",
  "mudra yojana (kishor)": "ಮುದ್ರಾ ಯೋಜನೆ (ಕಿಶೋರ)",
  "mudra yojana (tarun)": "ಮುದ್ರಾ ಯೋಜನೆ (ತರುಣ)",
  "national apprenticeship promotion scheme": "ರಾಷ್ಟ್ರೀಯ ಶಿಷ್ಯವೃತ್ತಿ ಪ್ರೋತ್ಸಾಹ ಯೋಜನೆ",
  "national scholarship portal - post matric": "ರಾಷ್ಟ್ರೀಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪೋರ್ಟಲ್ - ಮೆಟ್ರಿಕ್ ನಂತರದ",
  "beti bachao beti padhao": "ಬೇಟಿ ಬಚಾವೋ ಬೇಟಿ ಪಢಾವೋ",
  "pm vishwakarma yojana": "ಪಿಎಂ ವಿಶ್ವಕರ್ಮ ಯೋಜನೆ",
  "karnataka vidyasiri scholarship": "ಕರ್ನಾಟಕ ವಿದ್ಯಾಸಿರಿ ವಿದ್ಯಾರ್ಥಿವೇತನ",
  "pradhan mantri fasal bima yojana": "ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ",
  "sukanya samriddhi yojana": "ಸುಕನ್ಯಾ ಸಮೃದ್ಧಿ ಯೋಜನೆ",
  "atal pension yojana": "ಅಟಲ್ ಪಿಂಚಣಿ ಯೋಜನೆ",
  "stand-up india scheme": "ಸ್ಟ್ಯಾಂಡ್-ಅಪ್ ಇಂಡಿಯಾ ಯೋಜನೆ",
  "mgnrega": "ಎಂಜಿಎನ್‌ಆರ್‌ಇಜಿಎ",
  "pm ujjwala yojana": "ಪಿಎಂ ಉಜ್ವಲ ಯೋಜನೆ",
};

const hasKannada = (value: unknown) => typeof value === "string" && /[\u0C80-\u0CFF]/.test(value);
const metaKn = (value: unknown) => {
  const text = String(value ?? "").trim();
  return KN_META[text.toLowerCase()] ?? localizeKannada(text);
};

const localizeKannada = (value: unknown) => {
  let out = String(value ?? "").trim();
  if (!out) return "";
  const direct = KN_NAMES[out.toLowerCase()] || KN_META[out.toLowerCase()];
  if (direct) return direct;

  const replacements: Array<[RegExp, string]> = [
    [/direct benefit transfer/gi, "ನೇರ ಲಾಭ ವರ್ಗಾವಣೆ"],
    [/farmer families/gi, "ರೈತ ಕುಟುಂಬಗಳು"],
    [/farmers/gi, "ರೈತರು"],
    [/students/gi, "ವಿದ್ಯಾರ್ಥಿಗಳು"],
    [/entrepreneurs/gi, "ಉದ್ಯಮಿಗಳು"],
    [/women/gi, "ಮಹಿಳೆಯರು"],
    [/girl child under 10/gi, "10 ವರ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ ವಯಸ್ಸಿನ ಹೆಣ್ಣು ಮಗು"],
    [/girl child/gi, "ಹೆಣ್ಣು ಮಗು"],
    [/bpl families/gi, "ಬಿಪಿಎಲ್ ಕುಟುಂಬಗಳು"],
    [/urban poor/gi, "ನಗರ ಬಡವರು"],
    [/rural poor/gi, "ಗ್ರಾಮೀಣ ಬಡವರು"],
    [/senior citizens/gi, "ಹಿರಿಯ ನಾಗರಿಕರು"],
    [/disabled persons/gi, "ಅಂಗವಿಕಲ ವ್ಯಕ್ತಿಗಳು"],
    [/pregnant women/gi, "ಗರ್ಭಿಣಿ ಮಹಿಳೆಯರು"],
    [/unorganised workers/gi, "ಅಸಂಘಟಿತ ಕಾರ್ಮಿಕರು"],
    [/small entrepreneurs/gi, "ಸಣ್ಣ ಉದ್ಯಮಿಗಳು"],
    [/artisans/gi, "ಕುಶಲಕರ್ಮಿಗಳು"],
    [/all citizens/gi, "ಎಲ್ಲ ನಾಗರಿಕರು"],
    [/all india/gi, "ಅಖಿಲ ಭಾರತ"],
    [/financial assistance/gi, "ಆರ್ಥಿಕ ಸಹಾಯ"],
    [/welfare benefits/gi, "ಕಲ್ಯಾಣ ಸೌಲಭ್ಯಗಳು"],
    [/subsidies/gi, "ಸಬ್ಸಿಡಿಗಳು"],
    [/subsidy/gi, "ಸಬ್ಸಿಡಿ"],
    [/support/gi, "ಬೆಂಬಲ"],
    [/education/gi, "ಶಿಕ್ಷಣ"],
    [/health insurance/gi, "ಆರೋಗ್ಯ ವಿಮೆ"],
    [/insurance/gi, "ವಿಮೆ"],
    [/housing/gi, "ವಸತಿ"],
    [/loan/gi, "ಸಾಲ"],
    [/per year/gi, "ಪ್ರತಿ ವರ್ಷ"],
    [/per month/gi, "ಪ್ರತಿ ತಿಂಗಳು"],
    [/eligible/gi, "ಅರ್ಹ"],
    [/residing in/gi, "ನಲ್ಲಿ ವಾಸಿಸುವ"],
    [/matched based on strong alignment with your demographic profile\./gi, "ನಿಮ್ಮ ಜನಸಂಖ್ಯಾ ಪ್ರೊಫೈಲ್‌ಗೆ ಬಲವಾದ ಹೊಂದಾಣಿಕೆಯ ಆಧಾರದಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ."],
    [/matched based on partial alignment with your demographic profile\./gi, "ನಿಮ್ಮ ಜನಸಂಖ್ಯಾ ಪ್ರೊಫೈಲ್‌ಗೆ ಭಾಗಶಃ ಹೊಂದಾಣಿಕೆಯ ಆಧಾರದಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ."],
    [/matched based on strong alignment with your age, income, and location profile\./gi, "ನಿಮ್ಮ ವಯಸ್ಸು, ಆದಾಯ ಮತ್ತು ಸ್ಥಳಕ್ಕೆ ಬಲವಾದ ಹೊಂದಾಣಿಕೆಯ ಆಧಾರದಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ."],
    [/matched based on partial alignment with your age, income, and location profile\./gi, "ನಿಮ್ಮ ವಯಸ್ಸು, ಆದಾಯ ಮತ್ತು ಸ್ಥಳಕ್ಕೆ ಭಾಗಶಃ ಹೊಂದಾಣಿಕೆಯ ಆಧಾರದಲ್ಲಿ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ."],
    [/PMJAY/g, "ಪಿಎಂಜೆಎವೈ"], [/PM/g, "ಪಿಎಂ"], [/SC/g, "ಎಸ್‌ಸಿ"], [/ST/g, "ಎಸ್‌ಟಿ"], [/OBC/g, "ಒಬಿಸಿ"],
    [/BPL/g, "ಬಿಪಿಎಲ್"], [/APL/g, "ಎಪಿಎಲ್"], [/EWS/g, "ಇಡಬ್ಲ್ಯುಎಸ್"], [/LIG/g, "ಎಲ್ಐಜಿ"],
    [/scheme/gi, "ಯೋಜನೆ"], [/yojana/gi, "ಯೋಜನೆ"], [/scholarship/gi, "ವಿದ್ಯಾರ್ಥಿವೇತನ"],
    [/category/gi, "ವರ್ಗ"], [/families/gi, "ಕುಟುಂಬಗಳು"], [/family/gi, "ಕುಟುಂಬ"], [/income/gi, "ಆದಾಯ"],
    [/benefits/gi, "ಸೌಲಭ್ಯಗಳು"], [/benefit/gi, "ಸೌಲಭ್ಯ"], [/application/gi, "ಅರ್ಜಿ"], [/applicants/gi, "ಅರ್ಜಿದಾರರು"],
    [/only/gi, "ಮಾತ್ರ"], [/must be from/gi, "ಇಲ್ಲಿಂದಿರಬೇಕು"], [/age must be/gi, "ವಯಸ್ಸು ಇರಬೇಕು"], [/income must be under/gi, "ಆದಾಯ ಕಡಿಮೆ ಇರಬೇಕು"],
    [/male/gi, "ಪುರುಷ"], [/female/gi, "ಮಹಿಳೆ"], [/all/gi, "ಎಲ್ಲರೂ"],
    [/and/gi, "ಮತ್ತು"], [/for/gi, "ಗಾಗಿ"], [/to/gi, "ಗೆ"], [/of/gi, ""], [/in/gi, "ನಲ್ಲಿ"], [/under/gi, "ಅಡಿಯಲ್ಲಿ"],
  ];
  for (let i = 0; i < 3; i++) {
    const before = out;
    for (const [pattern, replacement] of replacements) out = out.replace(pattern, replacement);
    if (before === out) break;
  }
  return out
    .replace(/\b[A-Za-z]{2,}\b/g, "")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const missingKn = (text: string) => localizeKannada(text);

const enrichScheme = (scheme: any, rec: any, isKn: boolean) => {
  const schemeName = scheme.scheme_name || scheme.title_en || scheme.title || "";
  const titleKn = scheme.scheme_name_kn || scheme.title_kn || localizeKannada(schemeName);
  const categoryKn = scheme.category_kn || metaKn(scheme.category);
  const targetKn = scheme.target_group_kn || metaKn(scheme.target_group);
  const stateKn = scheme.state_kn || metaKn(scheme.state);
  const benefitsKn = scheme.benefits_kn || localizeKannada(scheme.benefits || scheme.benefits_en || "");
  const descriptionKn = scheme.description_kn || localizeKannada(scheme.description || scheme.description_en || "");
  const eligibilityKn = scheme.eligibility_kn || localizeKannada(scheme.eligibility || scheme.eligibility_en || targetKn);
  const explanationKn = rec.explanation_kn || localizeKannada(rec.explanation || "");
  const missing = rec.missing_criteria || [];

  return {
    id: scheme.id,
    scheme_name: isKn ? titleKn : schemeName,
    scheme_name_en: schemeName,
    scheme_name_kn: titleKn,
    title_kn: titleKn,
    category: isKn ? categoryKn : scheme.category,
    category_en: scheme.category,
    category_kn: categoryKn,
    target_group: isKn ? targetKn : scheme.target_group,
    target_group_en: scheme.target_group,
    target_group_kn: targetKn,
    benefits: isKn ? benefitsKn : scheme.benefits,
    benefits_en: scheme.benefits,
    benefits_kn: benefitsKn,
    description: isKn ? descriptionKn : scheme.description,
    description_en: scheme.description,
    description_kn: descriptionKn,
    eligibility: isKn ? eligibilityKn : scheme.eligibility,
    eligibility_en: scheme.eligibility,
    eligibility_kn: eligibilityKn,
    deadline: scheme.deadline,
    official_link: scheme.official_link,
    state: isKn ? stateKn : scheme.state,
    state_en: scheme.state,
    state_kn: stateKn,
    match_percentage: Math.max(0, Math.min(100, Math.round(Number(rec.match_percentage) || 0))),
    eligibility_status: rec.eligibility_status,
    missing_criteria: isKn ? missing.map(missingKn) : missing,
    explanation: isKn ? explanationKn : (rec.explanation || ""),
    explanation_kn: explanationKn,
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, profile, mode, language } = await req.json();
    const isKn = language === "kn";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: schemes, error: schemeErr } = await supabase
      .from("schemes")
      .select("*")
      .eq("is_active", true);

    if (schemeErr || !schemes || schemes.length === 0) {
      return new Response(JSON.stringify({ recommendations: [], message: isKn ? "ಯೋಜನೆಗಳು ಲಭ್ಯವಿಲ್ಲ" : "No schemes available" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (LOVABLE_API_KEY && mode === "nlp" && query) {
      const schemeSummary = schemes.map((s: any) =>
        `ID:${s.id}|Name:${s.scheme_name}|Cat:${s.category}|Target:${s.target_group}|Income:${s.income_limit || "none"}|Age:${s.min_age}-${s.max_age}|State:${s.state}|Gender:${s.gender}|Edu:${s.education_level || "any"}|Occ:${s.occupation || "any"}|Benefits:${s.benefits}`,
      ).join("\n");

      const systemPrompt = `You are YojanaMitraAI, an expert government scheme recommendation engine for India.
Given a user's natural language description and a list of government schemes, analyze eligibility and return recommendations.

SCHEMES DATABASE:
${schemeSummary}

Return a JSON array of recommendations. For each scheme, include id, match_percentage, eligibility_status, missing_criteria, and explanation.

CRITICAL: missing_criteria MUST be an array of short English strings. When a scheme is "not_eligible" or "partial", populate it with one entry per failing requirement, using EXACTLY these formats:
  - "Age must be 18-35"
  - "Income must be under ₹2,50,000"
  - "Must be from Karnataka"
  - "Female applicants only"
  - "Must be SC/ST/OBC category"
Replace the example values with the scheme's actual values. Use the rupee symbol ₹ and Indian comma formatting for income. If the user is fully eligible, return missing_criteria as an empty array [].

Only include schemes with match_percentage >= 30. Sort descending. Return at most 10 results. Return ONLY valid JSON array.`;

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: query }],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "[]";
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const aiRecs = JSON.parse(jsonMatch[0]);
            const pAge = profile?.age ? parseInt(profile.age) : null;
            const pIncome = profile?.income ? parseInt(profile.income) : null;
            const pGender = profile?.gender || null;
            const pState = profile?.state || null;
            const deriveMissing = (scheme: any): string[] => {
              const out: string[] = [];
              if (scheme.min_age != null && scheme.max_age != null && pAge != null &&
                  (pAge < scheme.min_age || pAge > scheme.max_age)) {
                out.push(`Age must be ${scheme.min_age}-${scheme.max_age}`);
              }
              if (scheme.income_limit != null && pIncome != null && pIncome > scheme.income_limit) {
                out.push(`Income must be under ₹${Number(scheme.income_limit).toLocaleString("en-IN")}`);
              }
              if (scheme.state && scheme.state !== "All India" && pState && pState !== scheme.state) {
                out.push(`Must be from ${scheme.state}`);
              }
              if (scheme.gender && scheme.gender !== "All" && pGender && pGender !== scheme.gender) {
                out.push(`${scheme.gender} applicants only`);
              }
              return out;
            };
            const enriched = aiRecs.map((rec: any) => {
              const scheme = schemes.find((s: any) => s.id === rec.id);
              if (!scheme) return null;
              const status = rec.eligibility_status;
              const existing = Array.isArray(rec.missing_criteria) ? rec.missing_criteria : [];
              if ((status === "not_eligible" || status === "partial") && existing.length === 0) {
                rec.missing_criteria = deriveMissing(scheme);
              }
              return enrichScheme(scheme, rec, isKn);
            }).filter(Boolean);
            return new Response(JSON.stringify({ recommendations: enriched }), {
              headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
            });
          }
        }
      } catch (aiErr) {
        console.error("AI error, falling back to rule-based:", aiErr);
      }
    }

    const age = profile?.age ? parseInt(profile.age) : 25;
    const income = profile?.income ? parseInt(profile.income) : 300000;
    const gender = profile?.gender || "All";
    const state = profile?.state || "All India";
    const occupation = profile?.occupation || "";
    const education = profile?.education_level || "";
    const category = profile?.category || "";

    const scored = schemes.map((s: any) => {
      let score = 0;
      const missing: string[] = [];
      if (age >= (s.min_age || 0) && age <= (s.max_age || 100)) score += 20;
      else missing.push(`Age must be ${s.min_age}-${s.max_age}`);
      if (!s.income_limit || income <= s.income_limit) score += 20;
      else missing.push(`Income must be under ₹${s.income_limit?.toLocaleString()}`);
      if (s.state === "All India" || s.state === state) score += 15;
      else missing.push(`Must be from ${s.state}`);
      if (s.gender === "All" || s.gender === gender) score += 10;
      else missing.push(`${s.gender} applicants only`);
      if (!s.education_level || s.education_level === education) score += 15;
      if (!s.occupation || s.occupation === occupation) score += 10;
      if (s.target_group === "All" || s.target_group?.toLowerCase().includes(category.toLowerCase())) score += 10;
      score = Math.min(score, 98);
      const status = score >= 70 ? "eligible" : score >= 40 ? "partial" : "not_eligible";
      const explanation = `Matched based on ${score >= 70 ? "strong" : "partial"} alignment with your demographic profile.`;
      return enrichScheme(s, { match_percentage: score, eligibility_status: status, missing_criteria: missing, explanation }, isKn);
    });

    const filtered = scored.filter((s: any) => s.match_percentage >= 30)
      .sort((a: any, b: any) => b.match_percentage - a.match_percentage)
      .slice(0, 10);

    return new Response(JSON.stringify({ recommendations: filtered }), {
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
    });
  }
});
