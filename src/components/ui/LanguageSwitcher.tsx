import React, { useState } from 'react';
import { Globe, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, isRTL, updateDocumentDirection } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    if (isChanging || i18n.language === languageCode) return;

    setIsChanging(true);

    try {
      // Ensure the language is supported
      if (!Object.keys(supportedLanguages).includes(languageCode)) {
        throw new Error(`Unsupported language: ${languageCode}`);
      }

      await i18n.changeLanguage(languageCode);
      updateDocumentDirection(languageCode);

      // Optional: Show success feedback
      const langName = supportedLanguages[languageCode as keyof typeof supportedLanguages]?.nativeName;
      toast({
        title: "Language Changed",
        description: `Interface language changed to ${langName}`,
        duration: 2000,
      });

      // Force a re-render by updating the page title
      document.title = `BeProductive - ${langName}`;

    } catch (error) {
      console.error('Language change failed:', error);
      toast({
        title: "Language Change Failed",
        description: "Could not change language. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsChanging(false);
    }
  };

  const currentLanguage = supportedLanguages[i18n.language as keyof typeof supportedLanguages];
  const isCurrentRTL = isRTL(i18n.language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={isChanging}>
          {isChanging ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {currentLanguage?.flag} {currentLanguage?.nativeName || 'English'}
          </span>
          <span className="sm:hidden">
            {currentLanguage?.flag}
          </span>
          {isCurrentRTL && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              RTL
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(supportedLanguages).map(([code, language]) => {
          const isSelected = i18n.language === code;
          const isRTLLang = isRTL(code);

          return (
            <DropdownMenuItem
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={`flex items-center justify-between cursor-pointer ${
                isSelected ? 'bg-accent' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {language.nativeName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {language.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isRTLLang && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    RTL
                  </Badge>
                )}
                {isSelected && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Alternative compact version for mobile
export function CompactLanguageSwitcher() {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    if (isChanging || i18n.language === languageCode) return;

    setIsChanging(true);

    try {
      if (!Object.keys(supportedLanguages).includes(languageCode)) {
        throw new Error(`Unsupported language: ${languageCode}`);
      }

      await i18n.changeLanguage(languageCode);
      updateDocumentDirection(languageCode);

      const langName = supportedLanguages[languageCode as keyof typeof supportedLanguages]?.nativeName;
      toast({
        title: "Language Changed",
        description: `${langName}`,
        duration: 2000,
      });

    } catch (error) {
      console.error('Language change failed:', error);
      toast({
        title: "Error",
        description: "Could not change language",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsChanging(false);
    }
  };

  const currentLanguage = supportedLanguages[i18n.language as keyof typeof supportedLanguages];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isChanging}>
          {isChanging ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <span className="text-base">{currentLanguage?.flag || '🌐'}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {Object.entries(supportedLanguages).map(([code, language]) => {
          const isSelected = i18n.language === code;

          return (
            <DropdownMenuItem
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={`flex items-center gap-2 cursor-pointer ${
                isSelected ? 'bg-accent' : ''
              }`}
            >
              <span>{language.flag}</span>
              <span className="text-sm">{language.nativeName}</span>
              {isSelected && <Check className="h-3 w-3 ml-auto text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}