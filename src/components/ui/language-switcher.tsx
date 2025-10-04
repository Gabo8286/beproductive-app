import React from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { supportedLanguages, isRTL, updateDocumentDirection } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = "ghost",
  size = "icon",
  className,
  showLabel = false,
}) => {
  const { i18n, t } = useTranslation("settings");

  const handleLanguageChange = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    updateDocumentDirection(languageCode);

    // Store preference
    localStorage.setItem("i18nextLng", languageCode);

    // Update page title if needed
    document.title = t("title", { ns: "common" });
  };

  const currentLanguage =
    supportedLanguages[i18n.language as keyof typeof supportedLanguages];
  const currentIsRTL = isRTL(i18n.language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("relative", className)}
          aria-label={t("languageSelection")}
        >
          {showLabel && currentLanguage ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentLanguage.flag}</span>
              <span className="text-sm font-medium">
                {currentLanguage.nativeName}
              </span>
            </div>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              {currentLanguage && (
                <span className="absolute -top-1 -right-1 text-xs">
                  {currentLanguage.flag}
                </span>
              )}
            </>
          )}
          <span className="sr-only">{t("languageSelection")}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={currentIsRTL ? "start" : "end"}
        className="w-64"
      >
        <div className="px-2 py-1.5 text-sm font-semibold">{t("language")}</div>

        {Object.entries(supportedLanguages).map(([code, language]) => {
          const isSelected = i18n.language === code;
          const isRTLLang = language.rtl;

          return (
            <DropdownMenuItem
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={cn(
                "flex items-center justify-between cursor-pointer px-3 py-2",
                isRTLLang && "flex-row-reverse",
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-3",
                  isRTLLang && "flex-row-reverse",
                )}
              >
                <span className="text-lg" role="img" aria-label={language.name}>
                  {language.flag}
                </span>
                <div className={cn("flex flex-col", isRTLLang && "items-end")}>
                  <span className="font-medium text-sm">
                    {language.nativeName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {language.name}
                  </span>
                </div>
              </div>

              {isSelected && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}

        <div className="mt-2 px-3 py-2 text-xs text-muted-foreground border-t">
          💡 {t("languageSelection")}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Compact version for mobile or space-constrained areas
export const CompactLanguageSwitcher: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const languageCode = e.target.value;
    i18n.changeLanguage(languageCode);
    updateDocumentDirection(languageCode);
  };

  return (
    <select
      value={i18n.language}
      onChange={handleLanguageChange}
      className={cn(
        "px-2 py-1 text-sm border rounded bg-background text-foreground",
        className,
      )}
      aria-label="Select language"
    >
      {Object.entries(supportedLanguages).map(([code, language]) => (
        <option key={code} value={code}>
          {language.flag} {language.nativeName}
        </option>
      ))}
    </select>
  );
};
