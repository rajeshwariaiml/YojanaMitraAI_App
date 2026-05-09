import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslation } from "@/context/LanguageContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: t("toast_fill_all_fields"), variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: t("toast_invalid_email"), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      let description = error.message;
      if (error.message.includes("Invalid login")) {
        description = t("toast_incorrect_credentials");
      } else if (error.message.includes("Email not confirmed")) {
        description = t("toast_email_unverified");
      }
      toast({ title: t("toast_login_failed"), description, variant: "destructive" });
      return;
    }

    const name = data.user?.user_metadata?.full_name || data.user?.email?.split("@")[0] || t("user");
    toast({ title: t("toast_welcome_back", { name }), description: t("toast_redirecting_dashboard") });
    setTimeout(() => navigate("/dashboard"), 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, hsl(220 72% 97%) 0%, hsl(210 20% 98%) 50%, hsl(152 40% 96%) 100%)" }}>
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8 shadow-[var(--shadow-card)] animate-fade-up">
        <div className="flex justify-end mb-2"><LanguageToggle /></div>
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">YojanaMitraAI</span>
          </Link>
          <h1 className="font-display text-2xl font-bold">{t("welcome_back")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("welcome_back_sub")}</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {loading ? t("signing_in") : t("sign_in")}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground text-center font-medium mb-1">{t("demo_accounts")}</p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p><strong>{t("admin")}:</strong> admin@yojanamitra.ai / Admin@123</p>
            <p><strong>{t("user")}:</strong> demo@yojanamitra.ai / Demo@123</p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("no_account")} <Link to="/signup" className="text-primary font-medium hover:underline">{t("signup")}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
