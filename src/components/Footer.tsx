import { Shield } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

const Footer = () => {
  const t = useTranslation();
  return (
    <footer className="border-t border-border bg-secondary/30 py-10 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-display text-lg font-bold">{t("app_name")}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("footer_tagline")}</p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">{t("footer_quick_links")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-foreground transition-colors">{t("home")}</a></li>
              <li><a href="/find-schemes" className="hover:text-foreground transition-colors">{t("find_schemes")}</a></li>
              <li><a href="/dashboard" className="hover:text-foreground transition-colors">{t("dashboard")}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">{t("footer_about_title")}</h4>
            <p className="text-sm text-muted-foreground">{t("footer_about_text")}</p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t("app_name")}. {t("footer_copy")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
