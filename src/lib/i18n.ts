// i18n stub - temporarily disabled
export const i18n = {
  language: 'en',
  changeLanguage: (lang: string) => Promise.resolve(),
  t: (key: string) => key,
};

export const languages = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧', rtl: false },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
};

export const supportedLanguages = languages;

export const isRTL = (lang: string) => {
  const langData = languages[lang as keyof typeof languages];
  return langData?.rtl || false;
};

export const updateDocumentDirection = (lang: string) => {
  document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
};

export default i18n;
