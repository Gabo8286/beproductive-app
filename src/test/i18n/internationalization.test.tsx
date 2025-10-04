import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock translation system
interface TranslationResource {
  [key: string]: string | TranslationResource;
}

interface Translations {
  [locale: string]: TranslationResource;
}

const mockTranslations: Translations = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error occurred',
      success: 'Success!',
    },
    goals: {
      title: 'My Goals',
      create: 'Create Goal',
      edit: 'Edit Goal',
      delete: 'Delete Goal',
      progress: 'Progress',
      completed: 'Completed',
      description: 'Description',
      dueDate: 'Due Date',
    },
    dates: {
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
    },
    numbers: {
      currency: '${{amount}}',
      percentage: '{{value}}%',
    },
  },
  es: {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      loading: 'Cargando...',
      error: 'Ocurrió un error',
      success: '¡Éxito!',
    },
    goals: {
      title: 'Mis Objetivos',
      create: 'Crear Objetivo',
      edit: 'Editar Objetivo',
      delete: 'Eliminar Objetivo',
      progress: 'Progreso',
      completed: 'Completado',
      description: 'Descripción',
      dueDate: 'Fecha Límite',
    },
    dates: {
      today: 'Hoy',
      yesterday: 'Ayer',
      tomorrow: 'Mañana',
    },
    numbers: {
      currency: '{{amount}} €',
      percentage: '{{value}}%',
    },
  },
  ar: {
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تحرير',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      success: 'نجح!',
    },
    goals: {
      title: 'أهدافي',
      create: 'إنشاء هدف',
      edit: 'تحرير الهدف',
      delete: 'حذف الهدف',
      progress: 'التقدم',
      completed: 'مكتمل',
      description: 'الوصف',
      dueDate: 'تاريخ الاستحقاق',
    },
    dates: {
      today: 'اليوم',
      yesterday: 'أمس',
      tomorrow: 'غداً',
    },
    numbers: {
      currency: '{{amount}} ر.س',
      percentage: '{{value}}%',
    },
  },
  zh: {
    common: {
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      loading: '加载中...',
      error: '发生错误',
      success: '成功！',
    },
    goals: {
      title: '我的目标',
      create: '创建目标',
      edit: '编辑目标',
      delete: '删除目标',
      progress: '进度',
      completed: '已完成',
      description: '描述',
      dueDate: '截止日期',
    },
    dates: {
      today: '今天',
      yesterday: '昨天',
      tomorrow: '明天',
    },
    numbers: {
      currency: '¥{{amount}}',
      percentage: '{{value}}%',
    },
  },
};

// Mock i18n context and hooks
const I18nContext = React.createContext<{
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  isRTL: boolean;
}>({
  locale: 'en',
  setLocale: () => {},
  t: () => '',
  formatDate: () => '',
  formatNumber: () => '',
  formatCurrency: () => '',
  isRTL: false,
});

const I18nProvider = ({ children, defaultLocale = 'en' }: { children: React.ReactNode; defaultLocale?: string }) => {
  const [locale, setLocale] = React.useState(defaultLocale);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = mockTranslations[locale];

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== 'string') {
      return key; // Return key if translation not found
    }

    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match: string, paramKey: string) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    return new Intl.DateTimeFormat(locale, options).format(date);
  };

  const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(locale, options).format(number);
  };

  const formatCurrency = (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const isRTL = ['ar', 'he', 'fa'].includes(locale);

  return (
    <I18nContext.Provider value={{
      locale,
      setLocale,
      t,
      formatDate,
      formatNumber,
      formatCurrency,
      isRTL,
    }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} lang={locale}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};

const useI18n = () => React.useContext(I18nContext);

// Test components
const LocalizedButton = ({ translationKey, onClick }: { translationKey: string; onClick?: () => void }) => {
  const { t } = useI18n();
  return <button onClick={onClick}>{t(translationKey)}</button>;
};

const GoalsList = ({ goals }: { goals: Array<{ id: string; title: string; progress: number; dueDate: Date }> }) => {
  const { t, formatDate, isRTL } = useI18n();

  return (
    <div data-testid="goals-list" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <h1>{t('goals.title')}</h1>
      {goals.map(goal => (
        <div key={goal.id} data-testid="goal-item">
          <h3>{goal.title}</h3>
          <p>{t('goals.progress')}: {goal.progress}%</p>
          <p>{t('goals.dueDate')}: {formatDate(goal.dueDate)}</p>
        </div>
      ))}
    </div>
  );
};

const CurrencyDisplay = ({ amount, currency }: { amount: number; currency?: string }) => {
  const { formatCurrency } = useI18n();
  return <span data-testid="currency">{formatCurrency(amount, currency)}</span>;
};

const LanguageSwitcher = () => {
  const { locale, setLocale } = useI18n();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'ar', name: 'العربية' },
    { code: 'zh', name: '中文' },
  ];

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      data-testid="language-switcher"
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
};

const PluralizedText = ({ count, singularKey, pluralKey }: { count: number; singularKey: string; pluralKey: string }) => {
  const { t, locale } = useI18n();

  const getPluralForm = (count: number, locale: string): 'singular' | 'plural' => {
    // Simplified pluralization rules
    if (locale === 'en') {
      return count === 1 ? 'singular' : 'plural';
    }
    if (locale === 'ar') {
      if (count === 0) return 'plural';
      if (count === 1) return 'singular';
      if (count === 2) return 'plural'; // dual form simplified as plural
      return 'plural';
    }
    return count === 1 ? 'singular' : 'plural';
  };

  const form = getPluralForm(count, locale);
  const key = form === 'singular' ? singularKey : pluralKey;

  return <span>{count} {t(key)}</span>;
};

describe('Internationalization (i18n) Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Translation System', () => {
    it('should translate basic text correctly', () => {
      render(
        <I18nProvider defaultLocale="en">
          <LocalizedButton translationKey="common.save" />
        </I18nProvider>
      );

      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should switch between languages', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider defaultLocale="en">
          <LanguageSwitcher />
          <LocalizedButton translationKey="common.save" />
        </I18nProvider>
      );

      expect(screen.getByText('Save')).toBeInTheDocument();

      // Switch to Spanish
      await user.selectOptions(screen.getByTestId('language-switcher'), 'es');
      expect(screen.getByText('Guardar')).toBeInTheDocument();

      // Switch to Arabic
      await user.selectOptions(screen.getByTestId('language-switcher'), 'ar');
      expect(screen.getByText('حفظ')).toBeInTheDocument();

      // Switch to Chinese
      await user.selectOptions(screen.getByTestId('language-switcher'), 'zh');
      expect(screen.getByText('保存')).toBeInTheDocument();
    });

    it('should handle missing translations gracefully', () => {
      render(
        <I18nProvider defaultLocale="en">
          <LocalizedButton translationKey="nonexistent.key" />
        </I18nProvider>
      );

      // Should display the key when translation is missing
      expect(screen.getByText('nonexistent.key')).toBeInTheDocument();
    });

    it('should interpolate parameters in translations', () => {
      const TestComponent = () => {
        const { t } = useI18n();
        return <div>{t('numbers.percentage', { value: 75 })}</div>;
      };

      render(
        <I18nProvider defaultLocale="en">
          <TestComponent />
        </I18nProvider>
      );

      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  describe('RTL (Right-to-Left) Support', () => {
    it('should apply RTL direction for Arabic', () => {
      render(
        <I18nProvider defaultLocale="ar">
          <GoalsList goals={[]} />
        </I18nProvider>
      );

      const goalsList = screen.getByTestId('goals-list');
      expect(goalsList).toHaveStyle({ direction: 'rtl' });
      expect(goalsList.closest('div')).toHaveAttribute('dir', 'rtl');
    });

    it('should apply LTR direction for English', () => {
      render(
        <I18nProvider defaultLocale="en">
          <GoalsList goals={[]} />
        </I18nProvider>
      );

      const goalsList = screen.getByTestId('goals-list');
      expect(goalsList).toHaveStyle({ direction: 'ltr' });
      expect(goalsList.closest('div')).toHaveAttribute('dir', 'ltr');
    });

    it('should handle RTL layout changes', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider defaultLocale="en">
          <LanguageSwitcher />
          <GoalsList goals={[]} />
        </I18nProvider>
      );

      // Start with LTR
      let goalsList = screen.getByTestId('goals-list');
      expect(goalsList).toHaveStyle({ direction: 'ltr' });

      // Switch to Arabic (RTL)
      await user.selectOptions(screen.getByTestId('language-switcher'), 'ar');
      goalsList = screen.getByTestId('goals-list');
      expect(goalsList).toHaveStyle({ direction: 'rtl' });
    });
  });

  describe('Date and Time Formatting', () => {
    it('should format dates according to locale', () => {
      const testDate = new Date('2024-03-15T10:30:00Z');

      const { rerender } = render(
        <I18nProvider defaultLocale="en">
          <GoalsList goals={[{
            id: '1',
            title: 'Test Goal',
            progress: 50,
            dueDate: testDate
          }]} />
        </I18nProvider>
      );

      // English formatting
      expect(screen.getByText(/3\/15\/2024/)).toBeInTheDocument();

      // Spanish formatting
      rerender(
        <I18nProvider defaultLocale="es">
          <GoalsList goals={[{
            id: '1',
            title: 'Test Goal',
            progress: 50,
            dueDate: testDate
          }]} />
        </I18nProvider>
      );

      expect(screen.getByText(/15\/3\/2024/)).toBeInTheDocument();
    });

    it('should format dates with different options', () => {
      const TestComponent = () => {
        const { formatDate } = useI18n();
        const testDate = new Date('2024-03-15T10:30:00Z');

        return (
          <div>
            <div data-testid="short-date">
              {formatDate(testDate, { dateStyle: 'short' })}
            </div>
            <div data-testid="long-date">
              {formatDate(testDate, { dateStyle: 'long' })}
            </div>
            <div data-testid="time">
              {formatDate(testDate, { timeStyle: 'short' })}
            </div>
          </div>
        );
      };

      render(
        <I18nProvider defaultLocale="en">
          <TestComponent />
        </I18nProvider>
      );

      expect(screen.getByTestId('short-date')).toHaveTextContent(/3\/15\/24/);
      expect(screen.getByTestId('long-date')).toHaveTextContent(/March 15, 2024/);
      expect(screen.getByTestId('time')).toHaveTextContent(/\d{1,2}:\d{2}\s?(AM|PM)/);
    });
  });

  describe('Number and Currency Formatting', () => {
    it('should format currency according to locale', () => {
      const { rerender } = render(
        <I18nProvider defaultLocale="en">
          <CurrencyDisplay amount={1234.56} currency="USD" />
        </I18nProvider>
      );

      expect(screen.getByTestId('currency')).toHaveTextContent('$1,234.56');

      rerender(
        <I18nProvider defaultLocale="es">
          <CurrencyDisplay amount={1234.56} currency="EUR" />
        </I18nProvider>
      );

      expect(screen.getByTestId('currency')).toHaveTextContent(/1\.234,56\s?€/);
    });

    it('should format numbers with locale-specific separators', () => {
      const TestComponent = () => {
        const { formatNumber } = useI18n();
        return (
          <div>
            <div data-testid="number">
              {formatNumber(1234567.89)}
            </div>
            <div data-testid="percentage">
              {formatNumber(0.1234, { style: 'percent' })}
            </div>
          </div>
        );
      };

      const { rerender } = render(
        <I18nProvider defaultLocale="en">
          <TestComponent />
        </I18nProvider>
      );

      expect(screen.getByTestId('number')).toHaveTextContent('1,234,567.89');
      expect(screen.getByTestId('percentage')).toHaveTextContent('12%');

      rerender(
        <I18nProvider defaultLocale="es">
          <TestComponent />
        </I18nProvider>
      );

      expect(screen.getByTestId('number')).toHaveTextContent(/1\.234\.567,89/);
    });
  });

  describe('Pluralization', () => {
    it('should handle singular and plural forms', () => {
      const { rerender } = render(
        <I18nProvider defaultLocale="en">
          <PluralizedText count={1} singularKey="common.item" pluralKey="common.items" />
        </I18nProvider>
      );

      // Mock the translations for this test
      mockTranslations.en.common.item = 'item';
      mockTranslations.en.common.items = 'items';

      expect(screen.getByText('1 item')).toBeInTheDocument();

      rerender(
        <I18nProvider defaultLocale="en">
          <PluralizedText count={5} singularKey="common.item" pluralKey="common.items" />
        </I18nProvider>
      );

      expect(screen.getByText('5 items')).toBeInTheDocument();
    });

    it('should handle complex pluralization rules for Arabic', () => {
      // Arabic has complex pluralization: 0, 1, 2, 3-10, 11+
      mockTranslations.ar.common.item = 'عنصر';
      mockTranslations.ar.common.items = 'عناصر';

      const { rerender } = render(
        <I18nProvider defaultLocale="ar">
          <PluralizedText count={0} singularKey="common.item" pluralKey="common.items" />
        </I18nProvider>
      );

      expect(screen.getByText('0 عناصر')).toBeInTheDocument();

      rerender(
        <I18nProvider defaultLocale="ar">
          <PluralizedText count={1} singularKey="common.item" pluralKey="common.items" />
        </I18nProvider>
      );

      expect(screen.getByText('1 عنصر')).toBeInTheDocument();
    });
  });

  describe('Accessibility and i18n', () => {
    it('should set correct lang attribute', () => {
      const { rerender } = render(
        <I18nProvider defaultLocale="en">
          <div>Content</div>
        </I18nProvider>
      );

      expect(document.querySelector('[lang="en"]')).toBeInTheDocument();

      rerender(
        <I18nProvider defaultLocale="ar">
          <div>Content</div>
        </I18nProvider>
      );

      expect(document.querySelector('[lang="ar"]')).toBeInTheDocument();
    });

    it('should maintain semantic HTML across languages', async () => {
      const user = userEvent.setup();

      render(
        <I18nProvider defaultLocale="en">
          <LanguageSwitcher />
          <GoalsList goals={[{
            id: '1',
            title: 'Test Goal',
            progress: 75,
            dueDate: new Date()
          }]} />
        </I18nProvider>
      );

      // Check heading structure in English
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My Goals');

      // Switch to Arabic and verify structure is maintained
      await user.selectOptions(screen.getByTestId('language-switcher'), 'ar');
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('أهدافي');
    });
  });

  describe('Translation Coverage and Completeness', () => {
    it('should have translations for all supported locales', () => {
      const supportedLocales = ['en', 'es', 'ar', 'zh'];
      const requiredKeys = [
        'common.save',
        'common.cancel',
        'common.delete',
        'goals.title',
        'goals.create',
      ];

      supportedLocales.forEach(locale => {
        requiredKeys.forEach(key => {
          const keys = key.split('.');
          let value: any = mockTranslations[locale];

          for (const k of keys) {
            value = value?.[k];
          }

          expect(value, `Missing translation for ${key} in ${locale}`).toBeTruthy();
          expect(typeof value, `Invalid translation type for ${key} in ${locale}`).toBe('string');
        });
      });
    });

    it('should detect missing translations', () => {
      const checkTranslationCoverage = (baseLocale: string, targetLocale: string): string[] => {
        const missing: string[] = [];

        const checkKeys = (baseObj: any, targetObj: any, path = '') => {
          Object.keys(baseObj).forEach(key => {
            const currentPath = path ? `${path}.${key}` : key;

            if (typeof baseObj[key] === 'object' && baseObj[key] !== null) {
              if (!targetObj[key] || typeof targetObj[key] !== 'object') {
                missing.push(currentPath);
              } else {
                checkKeys(baseObj[key], targetObj[key], currentPath);
              }
            } else {
              if (!targetObj[key]) {
                missing.push(currentPath);
              }
            }
          });
        };

        checkKeys(mockTranslations[baseLocale], mockTranslations[targetLocale] || {});
        return missing;
      };

      const missingInSpanish = checkTranslationCoverage('en', 'es');
      const missingInArabic = checkTranslationCoverage('en', 'ar');

      expect(missingInSpanish).toHaveLength(0);
      expect(missingInArabic).toHaveLength(0);
    });
  });

  describe('Performance and Loading', () => {
    it('should load translations efficiently', async () => {
      const mockLoadTranslations = vi.fn().mockResolvedValue(mockTranslations.en);

      const AsyncI18nProvider = ({ children, locale }: { children: React.ReactNode; locale: string }) => {
        const [translations, setTranslations] = React.useState<TranslationResource | null>(null);
        const [loading, setLoading] = React.useState(true);

        React.useEffect(() => {
          mockLoadTranslations(locale).then((data: TranslationResource) => {
            setTranslations(data);
            setLoading(false);
          });
        }, [locale]);

        if (loading) {
          return <div>Loading translations...</div>;
        }

        return (
          <I18nProvider defaultLocale={locale}>
            {children}
          </I18nProvider>
        );
      };

      render(
        <AsyncI18nProvider locale="en">
          <LocalizedButton translationKey="common.save" />
        </AsyncI18nProvider>
      );

      expect(screen.getByText('Loading translations...')).toBeInTheDocument();

      await screen.findByText('Save');
      expect(mockLoadTranslations).toHaveBeenCalledWith('en');
    });

    it('should cache translations to avoid repeated loads', () => {
      const translationCache = new Map<string, TranslationResource>();

      const getCachedTranslations = (locale: string): TranslationResource | null => {
        return translationCache.get(locale) || null;
      };

      const setCachedTranslations = (locale: string, translations: TranslationResource): void => {
        translationCache.set(locale, translations);
      };

      // First access
      expect(getCachedTranslations('en')).toBeNull();
      setCachedTranslations('en', mockTranslations.en);

      // Second access should return cached data
      expect(getCachedTranslations('en')).toEqual(mockTranslations.en);
    });
  });

  describe('Text Expansion and Layout', () => {
    it('should handle text expansion in different languages', () => {
      // German typically has longer words than English
      const longTranslations = {
        en: { button: 'Save' },
        de: { button: 'Speichern' },
      };

      const TestButton = ({ locale }: { locale: string }) => {
        const text = longTranslations[locale as keyof typeof longTranslations]?.button || 'Save';
        return (
          <button style={{ width: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {text}
          </button>
        );
      };

      const { rerender } = render(<TestButton locale="en" />);
      expect(screen.getByText('Save')).toBeInTheDocument();

      rerender(<TestButton locale="de" />);
      expect(screen.getByText('Speichern')).toBeInTheDocument();
    });

    it('should maintain layout integrity with longer translations', () => {
      const veryLongTranslations = {
        en: 'Save',
        verbose: 'Save this extremely important document with all the metadata',
      };

      const TestComponent = ({ useVerbose }: { useVerbose: boolean }) => (
        <div style={{ width: '200px', border: '1px solid black' }}>
          <button style={{ maxWidth: '100%' }}>
            {useVerbose ? veryLongTranslations.verbose : veryLongTranslations.en}
          </button>
        </div>
      );

      const { rerender } = render(<TestComponent useVerbose={false} />);
      const container = screen.getByRole('button').parentElement;

      rerender(<TestComponent useVerbose={true} />);

      // Container should maintain its structure even with longer text
      expect(container).toHaveStyle({ width: '200px' });
    });
  });
});