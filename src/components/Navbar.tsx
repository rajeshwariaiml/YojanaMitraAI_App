import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupaUser } from "@supabase/supabase-js";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupaUser | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const isKn = language === "kn";
  const brandTitle = isKn ? "ಯೋಜನಾಮಿತ್ರ AI" : "YojanaMitra AI";
  const brandTagline = isKn
    ? "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಿಗೆ ನಿಮ್ಮ ಮಾರ್ಗದರ್ಶಿ"
    : "Your Guide to Government Schemes";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: t("toast_logout_success"), description: t("toast_logout_description") });
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: t("home") },
    { to: "/find-schemes", label: t("find_schemes") },
    ...(user ? [{ to: "/dashboard", label: t("dashboard") }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" lang={isKn ? "kn" : "en"}>
      {/* Tricolour top strip */}
      <div className="tricolour-bar h-1.5 w-full" aria-hidden />

      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="YojanaMitraAI Logo" className="w-8 h-8 object-contain" />
          <div className="leading-none">
            <span
              className="font-display text-lg font-bold gradient-tricolour-text block"
              lang={isKn ? "kn" : "en"}
            >
              {brandTitle}
            </span>
            <span
              className="text-[10px] text-muted-foreground font-medium tracking-wide"
              lang={isKn ? "kn" : "en"}
            >
              {brandTagline}
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground hover:text-[hsl(var(--tri-chakra))] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <LanguageToggle />
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm"><Bell className="h-4 w-4" /></Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{displayName}</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 border-[hsl(var(--tri-saffron)/0.6)] hover:bg-[hsl(var(--tri-saffron)/0.12)]"
              >
                <LogOut className="h-4 w-4" /> {t("logout")}
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">{t("login")}</Button>
              </Link>
              <Link to="/signup">
                <Button
                  size="sm"
                  className="bg-[hsl(var(--tri-green))] hover:bg-[hsl(120_82%_24%)] text-white"
                >
                  {t("signup")}
                </Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border px-4 pb-4 animate-fade-in">
          <div className="flex flex-col gap-2 pt-2">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm py-2 font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2"><LanguageToggle className="w-full justify-center" /></div>
            {user ? (
              <>
                <p className="text-xs text-muted-foreground py-1">
                  {t("signed_in_as")} <strong>{displayName}</strong>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                >
                  {t("logout")}
                </Button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full">{t("login")}</Button>
                </Link>
                <Link to="/signup" className="flex-1">
                  <Button
                    size="sm"
                    className="w-full bg-[hsl(var(--tri-green))] hover:bg-[hsl(120_82%_24%)] text-white"
                  >
                    {t("signup")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
