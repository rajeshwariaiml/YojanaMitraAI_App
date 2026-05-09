import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Lang = "en" | "kn" | string;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errors: string[];
  language?: Lang;
  title?: string;
}

export function InvalidInputDialog({
  open,
  onOpenChange,
  errors,
  language = "en",
  title,
}: Props) {
  const isKn = language === "kn";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-2 border-[#FF9933] overflow-hidden p-0 z-[100]">
        {/* tricolour bar */}
        <div className="flex h-2 w-full">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white border-y border-gray-200 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-[#000080]" />
            </div>
          </div>
          <div className="flex-1 bg-[#138808]" />
        </div>

        <div className="p-6">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF9933]/15">
                <AlertTriangle className="h-5 w-5 text-[#FF9933]" />
              </div>
              <AlertDialogTitle className="text-lg">
                {title ?? (isKn ? "ಮಾನ್ಯ ಮಾಹಿತಿ ನಮೂದಿಸಿ" : "Please enter valid information")}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              {isKn
                ? "ನಿಮ್ಮ ನಮೂದಿನಲ್ಲಿ ಕೆಲವು ಸಮಸ್ಯೆಗಳಿವೆ. ಮುಂದುವರೆಯಲು ದಯವಿಟ್ಟು ಸರಿಪಡಿಸಿ:"
                : "There are a few issues with your input. Please fix them to continue:"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <ul className="mt-4 space-y-2">
            {errors.map((e, i) => (
              <li
                key={i}
                className="flex gap-2 rounded-md border-l-4 border-[#138808] bg-[#138808]/5 px-3 py-2 text-sm"
              >
                <span className="text-[#138808] font-bold">•</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>

          <AlertDialogFooter className="mt-6">
            <AlertDialogAction className="bg-[#000080] hover:bg-[#000080]/90 text-white">
              {isKn ? "ಸರಿ, ಸರಿಪಡಿಸುತ್ತೇನೆ" : "OK, I'll fix it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default InvalidInputDialog;
