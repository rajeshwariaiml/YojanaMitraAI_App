import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  className?: string;
}

const LanguageToggle = ({ className }: Props) => {
  const { language, toggleLanguage } = useLanguage();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={`gap-1.5 ${className ?? ""}`}
      aria-label={language === "en" ? "Switch to Kannada" : "ಭಾಷೆ ಬದಲಿಸಿ"}
      title={language === "en" ? "Switch to Kannada" : "ಭಾಷೆ ಬದಲಿಸಿ"}
    >
      <Languages className="h-4 w-4" />
      <span className="font-medium">
        {language === "en" ? "English" : "ಕನ್ನಡ"}
      </span>
      <span className="text-muted-foreground text-xs">
        {language === "en" ? "| ಕನ್ನಡ" : "| ಇಂಗ್ಲಿಷ್"}
      </span>
    </Button>
  );
};

export default LanguageToggle;
