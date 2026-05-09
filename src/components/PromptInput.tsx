import { useEffect, useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  PROMPT_MAX,
  PROMPT_MIN,
  validatePrompt,
} from "@/utils/promptValidation";

type Lang = "en" | "kn";

interface PromptInputProps {
  lang?: Lang;
  initialValue?: string;
  onSubmit: (text: string) => void;
  isLoading?: boolean;
}

export function PromptInput({
  lang = "en",
  initialValue = "",
  onSubmit,
  isLoading = false,
}: PromptInputProps) {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const result = useMemo(() => validatePrompt(value), [value]);

  useEffect(() => {
    if (value.length > 0) setTouched(true);
  }, [value]);

  const showError = touched && !result.ok;
  const remaining = PROMPT_MAX - value.length;

  const placeholder =
    lang === "kn"
      ? `ಉದಾಹರಣೆ: "ನಾನು ಕರ್ನಾಟಕದ 22 ವರ್ಷದ ಮಹಿಳಾ ವಿದ್ಯಾರ್ಥಿನಿ, SC ವರ್ಗ, ಕುಟುಂಬ ಆದಾಯ 2 ಲಕ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ. ನಾನು ವಿದ್ಯಾರ್ಥಿವೇತನ ಮತ್ತು ಶಿಕ್ಷಣ ಸಾಲಗಳನ್ನು ಹುಡುಕುತ್ತಿದ್ದೇನೆ."`
      : `Example: "I am a 22-year-old female student from Karnataka, SC category, family income below 2 lakhs. I am looking for scholarships and education loans."`;

  const submitLabel = lang === "kn" ? "ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ" : "Find schemes";

  const counterLabel =
    lang === "kn"
      ? `${value.length} / ${PROMPT_MAX} ಅಕ್ಷರಗಳು`
      : `${value.length} / ${PROMPT_MAX} characters`;

  const handleSubmit = () => {
    setTouched(true);
    if (!result.ok) return;
    onSubmit(value.trim());
  };

  // 🔥 VOICE INPUT FUNCTION
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === "kn" ? "kn-IN" : "en-IN";
    recognition.start();

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;

      // append instead of replace (better UX)
      const newText = value ? value + " " + transcript : transcript;
      setValue(newText);
      onSubmit(newText); // 🔥 sync to parent

      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  return (<div className="space-y-2">
    <div className="flex items-start gap-2">
      
      {/* 🎤 MIC BUTTON */}
      <Button
        type="button"
        onClick={startListening}
        className="h-[80px] px-4 text-xl flex items-center justify-center"
      >
        {isListening ? "Listening.." : "🎙️"}
      </Button>
  
      {/* TEXTAREA */}
      <Textarea
        value={value}
        maxLength={PROMPT_MAX}
        minLength={PROMPT_MIN}
        placeholder={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
          onSubmit(e.target.value); // 🔥 sync to parent
        }}
        onBlur={() => setTouched(true)}
        aria-invalid={showError}
        aria-describedby="prompt-help"
        className={`flex-1 ${
          showError ? "border-destructive focus-visible:ring-destructive" : ""
        }`}
      />
    </div>
  
    <div className="flex items-center justify-between text-xs">
      <p
        id="prompt-help"
        className={
          showError ? "text-destructive" : "text-muted-foreground"
        }
      >
        {showError && !result.ok
          ? lang === "kn"
            ? (result as { messageKn?: string }).messageKn
            : (result as { message?: string }).message
          : lang === "kn"
          }
      </p>
  
      <span
        className={
          remaining < 50
            ? "text-destructive"
            : "text-muted-foreground"
        }
      >
        {counterLabel}
      </span>
    </div>
  </div>
  );
}

export default PromptInput;