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

export default i18n;
