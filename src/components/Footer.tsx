import { useLanguage } from "@/context/LanguageContext";
import { AlertCircle } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-secondary/30 py-8 mt-auto">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-start gap-3 max-w-2xl text-sm text-muted-foreground">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{t("footer.disclaimer")}</p>
          </div>
          <div className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} UniNavigator LK. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
