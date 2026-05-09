import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { translateMetadataValue, translateState } from "@/lib/translateScheme";

interface SchemeForm {
  scheme_name: string; category: string; target_group: string; income_limit: string;
  min_age: string; max_age: string; state: string; gender: string; education_level: string;
  occupation: string; documents_required: string; benefits: string; deadline: string;
  official_link: string; description: string;
}

const emptyForm: SchemeForm = {
  scheme_name: "", category: "", target_group: "", income_limit: "", min_age: "", max_age: "",
  state: "All India", gender: "All", education_level: "", occupation: "", documents_required: "",
  benefits: "", deadline: "", official_link: "", description: "",
};

const AdminPanel = () => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<SchemeForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      loadSchemes();
    };
    checkAccess();
  }, [navigate]);

  const loadSchemes = async () => {
    setLoading(true);
    const { data } = await supabase.from("schemes").select("*").order("created_at", { ascending: false });
    setSchemes(data ?? []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.scheme_name || !form.category || !form.benefits) {
      toast({ title: t("fill_required_fields"), variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      scheme_name: form.scheme_name,
      category: form.category,
      target_group: form.target_group || "All",
      income_limit: form.income_limit ? parseInt(form.income_limit) : null,
      min_age: form.min_age ? parseInt(form.min_age) : 0,
      max_age: form.max_age ? parseInt(form.max_age) : 100,
      state: form.state || "All India",
      gender: form.gender || "All",
      education_level: form.education_level || null,
      occupation: form.occupation || null,
      documents_required: form.documents_required ? form.documents_required.split(",").map(s => s.trim()) : null,
      benefits: form.benefits,
      deadline: form.deadline || null,
      official_link: form.official_link || null,
      description: form.description || null,
    };

    if (editingId) {
      const { error } = await supabase.from("schemes").update(payload).eq("id", editingId);
      if (error) toast({ title: t("error_updating"), variant: "destructive" });
      else toast({ title: t("scheme_updated") });
    } else {
      const { error } = await supabase.from("schemes").insert(payload);
      if (error) toast({ title: t("error_adding_scheme"), description: error.message, variant: "destructive" });
      else toast({ title: t("scheme_added") });
    }
    setForm(emptyForm);
    setEditingId(null);
    setSaving(false);
    loadSchemes();
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setForm({
      scheme_name: s.scheme_name, category: s.category, target_group: s.target_group,
      income_limit: s.income_limit?.toString() || "", min_age: s.min_age?.toString() || "",
      max_age: s.max_age?.toString() || "", state: s.state || "", gender: s.gender || "",
      education_level: s.education_level || "", occupation: s.occupation || "",
      documents_required: s.documents_required?.join(", ") || "", benefits: s.benefits,
      deadline: s.deadline || "", official_link: s.official_link || "", description: s.description || "",
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("schemes").delete().eq("id", id);
    if (error) toast({ title: t("error_deleting"), variant: "destructive" });
    else { toast({ title: t("scheme_deleted") }); loadSchemes(); }
  };

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 px-4 flex items-center justify-center">
          <div className="text-center space-y-4">
            <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
            <h1 className="font-display text-2xl font-bold">{t("access_denied")}</h1>
            <p className="text-muted-foreground">{t("access_denied_text")}</p>
            <Button onClick={() => navigate("/dashboard")}>{t("go_to_dashboard")}</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <div>
              <h1 className="font-display text-3xl font-bold">{t("admin_panel")}</h1>
              <p className="text-sm text-muted-foreground">{t("admin_subtitle")}</p>
            </div>
          </div>

          <Tabs defaultValue="add">
            <TabsList className="mb-6">
              <TabsTrigger value="add" className="gap-1.5"><Plus className="h-4 w-4" /> {editingId ? t("edit_scheme") : t("add_scheme")}</TabsTrigger>
              <TabsTrigger value="manage" className="gap-1.5"><Pencil className="h-4 w-4" /> {t("manage")} ({schemes.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="add">
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("scheme_name")} *</Label>
                    <Input value={form.scheme_name} onChange={e => setForm({ ...form, scheme_name: e.target.value })} placeholder="e.g. PM Kisan Samman Nidhi" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("category")} *</Label>
                    <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["Agriculture", "Education", "Health", "Housing", "Employment", "Women & Child", "Social Welfare", "Skill Development", "Financial Inclusion", "Other"].map(c =>
                          <SelectItem key={c} value={c}>{translateMetadataValue(c, language)}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("target_group")}</Label>
                    <Input value={form.target_group} onChange={e => setForm({ ...form, target_group: e.target.value })} placeholder="e.g. SC/ST Students, Farmers" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("income_limit")}</Label>
                    <Input type="number" value={form.income_limit} onChange={e => setForm({ ...form, income_limit: e.target.value })} placeholder="e.g. 250000" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("min_age")}</Label>
                    <Input type="number" value={form.min_age} onChange={e => setForm({ ...form, min_age: e.target.value })} placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("max_age")}</Label>
                    <Input type="number" value={form.max_age} onChange={e => setForm({ ...form, max_age: e.target.value })} placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("state")}</Label>
                    <Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="All India" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("gender")}</Label>
                    <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">{translateMetadataValue("All", language)}</SelectItem>
                        <SelectItem value="Male">{t("male")}</SelectItem>
                        <SelectItem value="Female">{t("female")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("education_level")}</Label>
                    <Input value={form.education_level} onChange={e => setForm({ ...form, education_level: e.target.value })} placeholder="e.g. Graduate" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("occupation")}</Label>
                    <Input value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} placeholder="e.g. Farmer, Student" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t("documents_required")}</Label>
                    <Input value={form.documents_required} onChange={e => setForm({ ...form, documents_required: e.target.value })} placeholder="Aadhaar, Income Certificate, Caste Certificate" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t("benefits")} *</Label>
                    <Textarea value={form.benefits} onChange={e => setForm({ ...form, benefits: e.target.value })} placeholder="Describe the scheme benefits..." />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("deadline")}</Label>
                    <Input value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} placeholder="e.g. March 31, 2026" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("official_link")}</Label>
                    <Input value={form.official_link} onChange={e => setForm({ ...form, official_link: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t("description")}</Label>
                    <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Full scheme description..." />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {editingId ? t("update_scheme") : t("add_scheme")}
                  </Button>
                  {editingId && (
                    <Button variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>{t("cancel")}</Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manage">
              {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : schemes.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">{t("no_schemes_added")}</div>
              ) : (
                <div className="space-y-3">
                  {schemes.map(s => (
                    <div key={s.id} className="bg-card border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display font-semibold text-sm">{s.scheme_name}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <Badge variant="secondary" className="text-xs">{translateMetadataValue(s.category, language)}</Badge>
                          <Badge variant="outline" className="text-xs">{translateState(s.state, language)}</Badge>
                          <Badge variant="outline" className="text-xs">{translateMetadataValue(s.target_group, language)}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.benefits}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;
