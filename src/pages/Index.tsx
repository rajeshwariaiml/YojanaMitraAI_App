import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Search, BarChart3, Bell, ArrowRight, CheckCircle2, Users, FileText, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "@/context/LanguageContext";

const Index = () => {
  const t = useTranslation();

  const features = [
    { icon: Sparkles, title: t("feature_ai_title"), desc: t("feature_ai_desc") },
    { icon: BarChart3, title: t("feature_gap_title"), desc: t("feature_gap_desc") },
    { icon: Bell, title: t("feature_alerts_title"), desc: t("feature_alerts_desc") },
    { icon: FileText, title: t("feature_autofill_title"), desc: t("feature_autofill_desc") },
  ];

  const stats = [
    { value: "500+", label: t("stats_schemes") },
    { value: "36", label: t("stats_states") },
    { value: "15+", label: t("stats_categories") },
    { value: "AI", label: t("stats_ai") },
  ];

  const steps = [
    { step: "1", title: t("step_1_title"), desc: t("step_1_desc") },
    { step: "2", title: t("step_2_title"), desc: t("step_2_desc") },
    { step: "3", title: t("step_3_title"), desc: t("step_3_desc") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)", opacity: 0.04 }} />
        <div className="absolute top-10 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl -z-10" />

        <div className="container mx-auto max-w-4xl text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-sm font-medium mb-6 border border-primary/15">
            <Shield className="h-4 w-4" /> {t("hero_badge")}
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            {t("hero_title_1")}<br />
            <span className="text-gradient">{t("hero_title_2")}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            {t("hero_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/find-schemes">
              <Button size="lg" className="gap-2 px-8 h-12 text-base">
                <Search className="h-4 w-4" /> {t("check_eligibility")}
              </Button>
            </Link>
            <Link to="/find-schemes">
              <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base">
                {t("explore_schemes")} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 border-y border-border bg-card">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-2xl md:text-3xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-3">{t("features_title")}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t("features_subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-lg bg-card border border-border card-hover">
                <div className="w-11 h-11 rounded-lg bg-primary/8 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-center mb-12">{t("steps_title")}</h2>
          <div className="space-y-6">
            {steps.map((item, i) => (
              <div key={i} className="flex gap-4 items-start bg-card border border-border rounded-lg p-5">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground font-display font-bold text-sm">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-6">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">{t("cta_title")}</h2>
          <p className="text-muted-foreground mb-8">{t("cta_subtitle")}</p>
          <Link to="/find-schemes">
            <Button size="lg" className="gap-2 px-8 h-12">
              <CheckCircle2 className="h-4 w-4" /> {t("check_eligibility_now")}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
