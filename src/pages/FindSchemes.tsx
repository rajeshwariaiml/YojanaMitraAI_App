import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageSquare, FileText, Loader2 } from "lucide-react";
import SchemeCard, { type SchemeResult } from "@/components/SchemeCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { translateMetadataValue, translateState } from "@/lib/translateScheme";
import InvalidInputDialog from "@/components/InvalidInputDialog";
import { validateDescription, validateProfileForm } from "@/lib/validateDescription";
import PromptInput from "@/components/PromptInput";

const states = ["All India", "Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Haryana", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"];
const occupations = ["Student", "Farmer", "Self-employed", "Salaried", "Unemployed", "Retired", "Homemaker", "Entrepreneur"];
const educationLevels = ["Below 10th", "10th Pass", "12th Pass", "Graduate", "Post Graduate", "PhD", "Diploma/ITI"];
const categories = ["General", "SC", "ST", "OBC", "EWS", "Minority"];

const FindSchemes = () => {
  const [nlpQuery, setNlpQuery] = useState("");
  const [formData, setFormData] = useState({ age: "", gender: "", income: "", occupation: "", education_level: "", state: "", category: "", goals: "" });
  const [results, setResults] = useState<SchemeResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { language, t } = useLanguage();

  // Pop-up state
  const [invalidOpen, setInvalidOpen] = useState(false);
  const [invalidErrors, setInvalidErrors] = useState<string[]>([]);

  const showInvalid = (errors: string[]) => {
    setInvalidErrors(errors);
    setInvalidOpen(true);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedSchemes");
      if (raw) {
        const list: SchemeResult[] = JSON.parse(raw);
        setSavedIds(new Set(list.map((s) => s.id)));
      }
    } catch { /* ignore */ }
  }, []);

  const pushHistory = (items: SchemeResult[]) => {
    try {
      const raw = localStorage.getItem("schemeHistory");
      const existing: SchemeResult[] = raw ? JSON.parse(raw) : [];
      const merged = [...items, ...existing.filter((e) => !items.some((i) => i.id === e.id))].slice(0, 30);
      localStorage.setItem("schemeHistory", JSON.stringify(merged));
    } catch { /* ignore */ }
  };

  const pushNotification = (title: string, message: string) => {
    try {
      const raw = localStorage.getItem("notifications");
      const list = raw ? JSON.parse(raw) : [];
      list.unshift({
        id: `local-${Date.now()}`,
        title,
        message,
        is_read: false,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem("notifications", JSON.stringify(list.slice(0, 50)));
    } catch { /* ignore */ }
  };

  const handleNlpSearch = async () => {
    // Strict validation -> popup
    const v = validateDescription(nlpQuery, language);
    if (!v.ok) {
      showInvalid(v.errors);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("recommend-schemes", {
        body: { query: nlpQuery.trim(), mode: "nlp", language },
      });
      if (error) throw error;
      const recs = data?.recommendations ?? [];
      setResults(recs);
      pushHistory(recs);
    } catch {
      toast({ title: t("toast_recommendation_error"), variant: "destructive" });
      await handleLocalFallback(nlpQuery);
    }
    setLoading(false);
  };

  const handleFormSearch = async () => {
    const v = validateProfileForm(formData, language);
    if (!v.ok) {
      showInvalid(v.errors);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("recommend-schemes", {
        body: { profile: formData, mode: "form", language },
      });
      if (error) throw error;
      const recs = data?.recommendations ?? [];
      setResults(recs);
      pushHistory(recs);
    } catch {
      await handleLocalFallback();
    }
    setLoading(false);
  };

  const handleLocalFallback = async (_query?: string) => {
    try {
      const { data: schemes } = await supabase.from("schemes").select("*").eq("is_active", true);
      if (!schemes || schemes.length === 0) {
        setResults([]);
        return;
      }
      const age = parseInt(formData.age) || 25;
      const income = parseInt(formData.income) || 300000;

      const scored: SchemeResult[] = schemes.map((s: any) => {
        let score = 0;
        const missing: string[] = [];
        if (age >= (s.min_age || 0) && age <= (s.max_age || 100)) score += 20;
        else missing.push(`Age must be ${s.min_age}-${s.max_age}`);
        if (!s.income_limit || income <= s.income_limit) score += 20;
        else missing.push(`Income must be under ₹${s.income_limit?.toLocaleString()}`);
        if (s.state === "All India" || s.state === formData.state) score += 15;
        else missing.push(`Must be from ${s.state}`);
        if (s.gender === "All" || s.gender === formData.gender) score += 10;
        else missing.push(`${s.gender} applicants only`);
        if (!s.education_level || s.education_level === formData.education_level) score += 15;
        if (!s.occupation || s.occupation === formData.occupation) score += 10;
        if (s.target_group === "All" || s.target_group?.toLowerCase().includes(formData.category?.toLowerCase() || "")) score += 10;

        score = Math.min(score, 98);
        const status = score >= 70 ? "eligible" : score >= 40 ? "partial" : "not_eligible";

        return {
          id: s.id,
          scheme_name: s.scheme_name,
          scheme_name_kn: s.scheme_name_kn || s.title_kn,
          category: s.category,
          category_kn: s.category_kn,
          target_group: s.target_group,
          target_group_kn: s.target_group_kn,
          benefits: s.benefits,
          benefits_kn: s.benefits_kn,
          description: s.description,
          description_kn: s.description_kn,
          eligibility: s.eligibility,
          eligibility_kn: s.eligibility_kn,
          deadline: s.deadline,
          official_link: s.official_link,
          state: s.state,
          state_kn: s.state_kn,
          match_percentage: score,
          eligibility_status: status as SchemeResult["eligibility_status"],
          missing_criteria: missing,
          explanation: `Matched based on ${score >= 70 ? "strong" : "partial"} alignment with your age, income, and location profile.`,
        };
      });

      const final = scored.sort((a, b) => b.match_percentage - a.match_percentage).slice(0, 10);
      setResults(final);
      pushHistory(final);
    } catch (e) {
      console.error("local fallback failed", e);
      setResults([]);
      toast({ title: t("toast_recommendation_error"), variant: "destructive" });
    }
  };

  const handleSave = async (scheme: SchemeResult) => {
    let nextList: SchemeResult[] = [];
    try {
      const raw = localStorage.getItem("savedSchemes");
      const existing: SchemeResult[] = raw ? JSON.parse(raw) : [];
      const exists = existing.some((s) => s.id === scheme.id);
      nextList = exists
        ? existing.filter((s) => s.id !== scheme.id)
        : [scheme, ...existing];
      localStorage.setItem("savedSchemes", JSON.stringify(nextList));
      setSavedIds(new Set(nextList.map((s) => s.id)));
      if (exists) {
        toast({ title: t("toast_removed_saved") });
      } else {
        toast({ title: t("toast_scheme_saved") });
        pushNotification(t("toast_scheme_saved"), scheme.scheme_name);
      }
    } catch (e) {
      console.error("local save failed", e);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      if (savedIds.has(scheme.id)) {
        await supabase.from("saved_schemes").delete().eq("user_id", session.user.id).eq("scheme_id", scheme.id);
      } else {
        const pct = Math.max(0, Math.min(100, Math.round(Number(scheme.match_percentage) || 0)));
        const { error: insertErr } = await supabase.from("saved_schemes").insert({
          user_id: session.user.id,
          scheme_id: scheme.id,
          match_percentage: pct,
        } as any);
        if (insertErr) console.error("saved_schemes insert error", insertErr);
      }
    } catch (e) {
      console.error("backend save sync failed", e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8 animate-fade-up">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{t("find_title")}</h1>
            <p className="text-muted-foreground">{t("find_subtitle")}</p>
          </div>

          {!results ? (
            <Tabs defaultValue="conversational" className="animate-fade-up">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="conversational" className="gap-2"><MessageSquare className="h-4 w-4" /> {t("tab_conversational")}</TabsTrigger>
                <TabsTrigger value="form" className="gap-2"><FileText className="h-4 w-4" /> {t("tab_form")}</TabsTrigger>
              </TabsList>

              <TabsContent value="conversational">
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <Label className="text-base font-display font-semibold">{t("tell_about_yourself")}</Label>
                  <PromptInput
                  lang={language}
                  onSubmit={(text) => setNlpQuery(text)} // ✅ only update state
                  isLoading={loading}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{language === "kn" ? "ಕನಿಷ್ಠ 10 ಅಕ್ಷರಗಳು" : "Minimum 10 characters"}</span>
                    <span>{nlpQuery.length} / 500</span>
                  </div>
                  <Button onClick={handleNlpSearch} disabled={loading} size="lg" className="w-full gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {loading ? t("analyzing") : t("find_matching")}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="form">
                <div className="bg-card border border-border rounded-lg p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("age")} *</Label>
                      <Input type="number" min={1} max={120} placeholder={t("age_placeholder")} value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("gender")}</Label>
                      <Select onValueChange={v => setFormData({ ...formData, gender: v })}>
                        <SelectTrigger><SelectValue placeholder={t("select")} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">{t("male")}</SelectItem>
                          <SelectItem value="Female">{t("female")}</SelectItem>
                          <SelectItem value="Other">{t("other")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("income")}</Label>
                      <Input type="number" min={0} placeholder={t("income_placeholder")} value={formData.income} onChange={e => setFormData({ ...formData, income: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("occupation")}</Label>
                      <Select onValueChange={v => setFormData({ ...formData, occupation: v })}>
                        <SelectTrigger><SelectValue placeholder={t("select")} /></SelectTrigger>
                        <SelectContent>
                          {occupations.map(o => <SelectItem key={o} value={o}>{translateMetadataValue(o, language)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("education_level")}</Label>
                      <Select onValueChange={v => setFormData({ ...formData, education_level: v })}>
                        <SelectTrigger><SelectValue placeholder={t("select")} /></SelectTrigger>
                        <SelectContent>
                          {educationLevels.map(e => <SelectItem key={e} value={e}>{translateMetadataValue(e, language)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("state")} *</Label>
                      <Select onValueChange={v => setFormData({ ...formData, state: v })}>
                        <SelectTrigger><SelectValue placeholder={t("select")} /></SelectTrigger>
                        <SelectContent>
                          {states.map(s => <SelectItem key={s} value={s}>{translateState(s, language)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("category")}</Label>
                      <Select onValueChange={v => setFormData({ ...formData, category: v })}>
                        <SelectTrigger><SelectValue placeholder={t("select")} /></SelectTrigger>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c} value={c}>{translateMetadataValue(c, language)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("goals")}</Label>
                      <Input placeholder={t("goals_placeholder")} value={formData.goals} onChange={e => setFormData({ ...formData, goals: e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={handleFormSearch} disabled={loading} size="lg" className="w-full gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {loading ? t("finding_schemes") : t("get_recommendations")}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="animate-fade-up">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">{results.length} {t("schemes_found")}</h2>
                  <p className="text-sm text-muted-foreground">{t("ranked_by_match")}</p>
                </div>
                <Button variant="outline" onClick={() => setResults(null)}>{t("new_search")}</Button>
              </div>
              {results.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p>{t("no_schemes_found")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map(s => (
                    <SchemeCard key={s.id} scheme={s} onSave={handleSave} isSaved={savedIds.has(s.id)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Validation popup */}
      <InvalidInputDialog
        open={invalidOpen}
        onOpenChange={setInvalidOpen}
        errors={invalidErrors}
        language={language}
      />
    </div>
  );
};

export default FindSchemes;
