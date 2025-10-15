import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

export const languages = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧', rtl: false },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
};

export const supportedLanguages = languages;
export const defaultLanguage = 'en';
export const supportedLanguageCodes = Object.keys(languages);

export const isRTL = (lang: string) => {
  const langData = languages[lang as keyof typeof languages];
  return langData?.rtl || false;
};

export const updateDocumentDirection = (lang: string) => {
  document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
};

// i18next configuration
i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: defaultLanguage,
    lng: defaultLanguage,
    supportedLngs: supportedLanguageCodes,

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'],
      checkWhitelist: true, // Only allow supported languages
    },

    // Namespace and resource configuration
    ns: ['common', 'navigation', 'tasks', 'goals', 'dashboard', 'forms', 'errors', 'auth'],
    defaultNS: 'common',

    // Resource loading
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      requestOptions: {
        cache: 'no-cache', // Ensure fresh translation files
      },
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // Development options
    debug: process.env.NODE_ENV === 'development',

    // Additional options
    load: 'languageOnly', // Don't load country-specific variants
    cleanCode: true,
    nonExplicitSupportedLngs: false, // Only use explicitly supported languages

    // React options
    react: {
      useSuspense: false, // Avoid suspense for better UX
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '', // Return empty string for missing translations
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'span'],
    },

    // Resources (will be loaded dynamically)
    resources: {},
  });

// Update document direction when language changes
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

// Initialize document direction
updateDocumentDirection(i18n.language);

export default i18n;
