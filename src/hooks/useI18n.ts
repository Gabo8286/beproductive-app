import { useTranslation, UseTranslationOptions } from "react-i18next";
import { useMemo } from "react";
import { isRTL } from "@/lib/i18n";

/**
 * Enhanced useTranslation hook with additional utilities
 */
export const useI18n = (
  ns?: string | string[],
  options?: UseTranslationOptions<any>,
) => {
  const translation = useTranslation(ns, options);
  const { i18n } = translation;

  const utilities = useMemo(
    () => ({
      // Current language info
      currentLanguage: i18n.language,
      isRTL: isRTL(i18n.language),

      // Language switching
      changeLanguage: (lng: string) => i18n.changeLanguage(lng),

      // Formatting helpers
      formatNumber: (value: number, options?: Intl.NumberFormatOptions) => {
        return new Intl.NumberFormat(i18n.language, options).format(value);
      },

      formatDate: (
        date: Date | string | number,
        options?: Intl.DateTimeFormatOptions,
      ) => {
        return new Intl.DateTimeFormat(i18n.language, options).format(
          new Date(date),
        );
      },

      formatCurrency: (value: number, currency: string = "USD") => {
        return new Intl.NumberFormat(i18n.language, {
          style: "currency",
          currency,
        }).format(value);
      },

      formatRelativeTime: (
        value: number,
        unit: Intl.RelativeTimeFormatUnit,
      ) => {
        return new Intl.RelativeTimeFormat(i18n.language, {
          numeric: "auto",
        }).format(value, unit);
      },

      // Pluralization helper
      plural: (count: number, key: string, options?: any) => {
        return translation.t(key, { count, ...options });
      },

      // Namespace switcher
      withNamespace: (namespace: string) => useTranslation(namespace),

      // Translation existence checker
      exists: (key: string, options?: any) => i18n.exists(key, options),

      // Get all translations for current language
      getTranslations: (namespace?: string) => {
        const ns = namespace || "common";
        return i18n.getResourceBundle(i18n.language, ns) || {};
      },
    }),
    [i18n, translation],
  );

  return {
    ...translation,
    ...utilities,
  };
};

/**
 * Hook for formatted dates with localization
 */
export const useLocalizedDate = () => {
  const { i18n } = useTranslation();

  return useMemo(
    () => ({
      formatDate: (
        date: Date | string | number,
        style: "short" | "medium" | "long" | "full" = "medium",
      ) => {
        const styleOptions: Record<string, Intl.DateTimeFormatOptions> = {
          short: { dateStyle: "short" as const },
          medium: { dateStyle: "medium" as const },
          long: { dateStyle: "long" as const },
          full: { dateStyle: "full" as const },
        };
        const options = styleOptions[style];

        return new Intl.DateTimeFormat(i18n.language, options).format(
          new Date(date),
        );
      },

      formatTime: (
        date: Date | string | number,
        includeSeconds: boolean = false,
      ) => {
        return new Intl.DateTimeFormat(i18n.language, {
          timeStyle: includeSeconds ? "medium" : "short",
        }).format(new Date(date));
      },

      formatDateTime: (date: Date | string | number) => {
        return new Intl.DateTimeFormat(i18n.language, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(date));
      },

      formatRelative: (date: Date | string | number) => {
        const now = new Date();
        const target = new Date(date);
        const diffInSeconds = Math.floor(
          (target.getTime() - now.getTime()) / 1000,
        );

        // Convert to appropriate unit
        if (Math.abs(diffInSeconds) < 60) {
          return new Intl.RelativeTimeFormat(i18n.language, {
            numeric: "auto",
          }).format(diffInSeconds, "second");
        } else if (Math.abs(diffInSeconds) < 3600) {
          return new Intl.RelativeTimeFormat(i18n.language, {
            numeric: "auto",
          }).format(Math.floor(diffInSeconds / 60), "minute");
        } else if (Math.abs(diffInSeconds) < 86400) {
          return new Intl.RelativeTimeFormat(i18n.language, {
            numeric: "auto",
          }).format(Math.floor(diffInSeconds / 3600), "hour");
        } else {
          return new Intl.RelativeTimeFormat(i18n.language, {
            numeric: "auto",
          }).format(Math.floor(diffInSeconds / 86400), "day");
        }
      },
    }),
    [i18n.language],
  );
};

/**
 * Hook for localized number formatting
 */
export const useLocalizedNumber = () => {
  const { i18n } = useTranslation();

  return useMemo(
    () => ({
      formatNumber: (value: number, options?: Intl.NumberFormatOptions) => {
        return new Intl.NumberFormat(i18n.language, options).format(value);
      },

      formatCurrency: (value: number, currency: string = "USD") => {
        return new Intl.NumberFormat(i18n.language, {
          style: "currency",
          currency,
        }).format(value);
      },

      formatPercent: (value: number, decimals: number = 1) => {
        return new Intl.NumberFormat(i18n.language, {
          style: "percent",
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
      },

      formatCompact: (value: number) => {
        return new Intl.NumberFormat(i18n.language, {
          notation: "compact",
          compactDisplay: "short",
        }).format(value);
      },
    }),
    [i18n.language],
  );
};

/**
 * Hook for handling RTL layout adjustments
 */
export const useRTL = () => {
  const { i18n } = useTranslation();
  const isRTLLayout = isRTL(i18n.language);

  return useMemo(
    () => ({
      isRTL: isRTLLayout,
      dir: isRTLLayout ? "rtl" : "ltr",

      // CSS class helpers
      textAlign: isRTLLayout ? "text-right" : "text-left",
      marginStart: isRTLLayout ? "mr" : "ml",
      marginEnd: isRTLLayout ? "ml" : "mr",
      paddingStart: isRTLLayout ? "pr" : "pl",
      paddingEnd: isRTLLayout ? "pl" : "pr",

      // Flexbox helpers
      flexDirection: isRTLLayout ? "flex-row-reverse" : "flex-row",

      // Transform helpers for icons/arrows
      transform: isRTLLayout ? "scaleX(-1)" : "none",

      // Utility function for conditional RTL classes
      rtlClass: (ltrClass: string, rtlClass: string) =>
        isRTLLayout ? rtlClass : ltrClass,
    }),
    [isRTLLayout],
  );
};

/**
 * Hook for translation keys validation (development only)
 */
export const useTranslationValidator = (
  enableValidation: boolean = process.env.NODE_ENV === "development",
) => {
  const { i18n } = useTranslation();

  return useMemo(
    () => ({
      validateKey: (key: string, namespace?: string) => {
        if (!enableValidation) return true;

        const ns = namespace || "common";
        const exists = i18n.exists(`${ns}:${key}`);

        if (!exists) {
          console.warn(`Translation key not found: ${ns}:${key}`);
        }

        return exists;
      },

      validateNamespace: (namespace: string) => {
        if (!enableValidation) return true;

        const bundle = i18n.getResourceBundle(i18n.language, namespace);
        const exists = !!bundle && Object.keys(bundle).length > 0;

        if (!exists) {
          console.warn(
            `Translation namespace not found or empty: ${namespace}`,
          );
        }

        return exists;
      },
    }),
    [i18n, enableValidation],
  );
};
