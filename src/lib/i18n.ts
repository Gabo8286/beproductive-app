import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// Supported languages configuration
export const supportedLanguages = {
  en: { name: "English", nativeName: "English", rtl: false, flag: "🇺🇸" },
  es: { name: "Spanish", nativeName: "Español", rtl: false, flag: "🇪🇸" },
  fr: { name: "French", nativeName: "Français", rtl: false, flag: "🇫🇷" },
  de: { name: "German", nativeName: "Deutsch", rtl: false, flag: "🇩🇪" },
  pt: { name: "Portuguese", nativeName: "Português", rtl: false, flag: "🇧🇷" },
  ar: { name: "Arabic", nativeName: "العربية", rtl: true, flag: "🇸🇦" },
  he: { name: "Hebrew", nativeName: "עברית", rtl: true, flag: "🇮🇱" },
};

export const defaultNamespace = "common";
export const fallbackLanguage = "en";

// RTL languages
export const rtlLanguages = ["ar", "he"];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Language settings
    fallbackLng: fallbackLanguage,
    supportedLngs: Object.keys(supportedLanguages),

    // Namespace settings
    defaultNS: defaultNamespace,
    ns: [
      "common",
      "dashboard",
      "tasks",
      "goals",
      "habits",
      "notes",
      "analytics",
      "settings",
      "auth",
      "errors",
    ],

    // Backend configuration
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
      addPath: "/locales/{{lng}}/{{ns}}.json",
    },

    // Language detection
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
      excludeCacheFor: ["cimode"],
    },

    // Development settings
    debug: process.env.NODE_ENV === "development",

    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes values
      format: (value, format) => {
        // Custom formatting
        if (format === "uppercase") return value.toUpperCase();
        if (format === "lowercase") return value.toLowerCase();
        if (format === "capitalize")
          return value.charAt(0).toUpperCase() + value.slice(1);
        return value;
      },
    },

    // React settings
    react: {
      useSuspense: false,
      bindI18n: "languageChanged",
      bindI18nStore: "",
      transEmptyNodeValue: "",
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ["br", "strong", "i"],
    },

    // Pluralization
    pluralSeparator: "_",
    contextSeparator: "_",

    // Missing key handling
    saveMissing: process.env.NODE_ENV === "development",
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Missing translation key: ${lng}:${ns}:${key}`);
      }
    },
  });

// RTL support
export const isRTL = (language?: string): boolean => {
  const lng = language || i18n.language;
  return rtlLanguages.includes(lng);
};

// Update document direction
export const updateDocumentDirection = (language?: string): void => {
  const lng = language || i18n.language;
  const direction = isRTL(lng) ? "rtl" : "ltr";

  document.documentElement.setAttribute("dir", direction);
  document.documentElement.setAttribute("lang", lng);
};

// Language change handler
i18n.on("languageChanged", (lng) => {
  updateDocumentDirection(lng);
});

export default i18n;
