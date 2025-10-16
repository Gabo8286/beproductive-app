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
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'],
    },

    // Namespace and resource configuration
    ns: ['common', 'navigation', 'tasks', 'goals', 'dashboard', 'forms', 'errors', 'auth', 'landing'],
    defaultNS: 'common',

    // Resource loading
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
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
    nonExplicitSupportedLngs: true,

    // React options
    react: {
      useSuspense: false, // Avoid suspense for better UX
      bindI18n: 'languageChanged',
      bindI18nStore: false,
      transEmptyNodeValue: '', // Return empty string for missing translations
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'span'],
    },

    // Resources (will be loaded dynamically)
    resources: {
      en: {
        landing: {
          hero: {
            title: {
              line1: "Unlock Your Full Potential:",
              line2: "Achieve More, Stress Less with "
            },
            subtitle: "Our AI-powered app helps you identify your unique productivity bottlenecks and provides a personalized action plan to conquer them.",
            cta: "Start Your Productivity Journey",
            showcase: {
              title: "BeProductive App",
              description: "Transform your productivity with AI-powered insights"
            }
          },
          features: {
            title: "How BeProductive Transforms Your Day",
            personalized: {
              title: "Personalized Insights",
              description: "Understand your unique work patterns and discover what truly drives your productivity."
            },
            habits: {
              title: "Smart Habit Tracking",
              description: "Build powerful routines with intelligent reminders and progress visualization."
            },
            goals: {
              title: "Goal Alignment",
              description: "Break down big goals into manageable steps and stay focused on what matters most."
            },
            progress: {
              title: "Progress Visualization",
              description: "See your achievements, track your growth, and stay motivated with clear visual reports."
            }
          },
          howItWorks: {
            title: "Ready to Boost Your Productivity?",
            description: "Take our quick, AI-driven assessment to pinpoint your productivity challenges and get your custom action plan. It takes just 3 minutes!",
            cta: "Take the Free Assessment"
          },
          pricing: {
            title: "Choose Your Plan",
            choosePlan: "Choose Plan",
            basic: {
              name: "Basic",
              price: "$9.99",
              period: "month",
              features: [
                "Core AI features",
                "Private & secure data",
                "Up to 10 projects",
                "Basic support"
              ]
            },
            professional: {
              name: "Professional",
              price: "$19.99",
              period: "month",
              features: [
                "Everything in Basic",
                "Advanced AI capabilities",
                "Unlimited projects",
                "5P-35 framework access",
                "Priority support"
              ]
            },
            teams: {
              name: "Teams",
              price: "$24.99",
              period: "user/month",
              features: [
                "Everything in Professional",
                "Team collaboration features",
                "Centralized billing",
                "Admin controls",
                "Dedicated support"
              ]
            }
          },
          beta: {
            title: "Join Our Early Access Program",
            description: "Be among the first to experience BeProductive. Sign up for exclusive early access and shape the future of productivity.",
            emailPlaceholder: "Your Email",
            namePlaceholder: "Your Name (Optional)",
            commentsPlaceholder: "Any comments or specific needs? (Optional)",
            submitButton: "Get Early Access",
            successMessage: "Thank you for your interest! We'll be in touch soon.",
            errorMessage: "Something went wrong. Please try again."
          }
        }
      },
      es: {
        landing: {
          hero: {
            title: {
              line1: "Desbloquea Tu Máximo Potencial:",
              line2: "Logra Más, Estrésate Menos con "
            },
            subtitle: "Nuestra aplicación impulsada por IA te ayuda a identificar tus cuellos de botella de productividad únicos y te proporciona un plan de acción personalizado para superarlos.",
            cta: "Comienza Tu Viaje de Productividad",
            showcase: {
              title: "BeProductive App",
              description: "Transforma tu productividad con insights potenciados por IA"
            }
          },
          features: {
            title: "Cómo BeProductive Transforma Tu Día",
            personalized: {
              title: "Análisis Personalizados",
              description: "Comprende tus patrones de trabajo únicos y descubre qué impulsa realmente tu productividad."
            },
            habits: {
              title: "Seguimiento Inteligente de Hábitos",
              description: "Construye rutinas poderosas con recordatorios inteligentes y visualización del progreso."
            },
            goals: {
              title: "Alineación de Metas",
              description: "Divide grandes metas en pasos manejables y mantente enfocado en lo más importante."
            },
            progress: {
              title: "Visualización del Progreso",
              description: "Observa tus logros, sigue tu crecimiento y mantente motivado con informes visuales claros."
            }
          },
          howItWorks: {
            title: "¿Listo para Impulsar tu Productividad?",
            description: "Realiza nuestra rápida evaluación impulsada por IA para identificar tus desafíos de productividad y obtener tu plan de acción personalizado. ¡Solo toma 3 minutos!",
            cta: "Realizar la Evaluación Gratuita"
          },
          pricing: {
            title: "Elige Tu Plan",
            choosePlan: "Elegir Plan",
            basic: {
              name: "Básico",
              price: "$9.99",
              period: "mes",
              features: [
                "Funciones principales de IA",
                "Datos privados y seguros",
                "Hasta 10 proyectos",
                "Soporte básico"
              ]
            },
            professional: {
              name: "Profesional",
              price: "$19.99",
              period: "mes",
              features: [
                "Todo en Básico",
                "Capacidades avanzadas de IA",
                "Proyectos ilimitados",
                "Acceso al marco 5P-35",
                "Soporte prioritario"
              ]
            },
            teams: {
              name: "Equipos",
              price: "$24.99",
              period: "usuario/mes",
              features: [
                "Todo en Profesional",
                "Funciones de colaboración en equipo",
                "Facturación centralizada",
                "Controles de administrador",
                "Soporte dedicado"
              ]
            }
          },
          beta: {
            title: "Únete a Nuestro Programa de Acceso Anticipado",
            description: "Sé de los primeros en experimentar BeProductive. Regístrate para acceso anticipado exclusivo y ayuda a dar forma al futuro de la productividad.",
            emailPlaceholder: "Tu Correo Electrónico",
            namePlaceholder: "Tu Nombre (Opcional)",
            commentsPlaceholder: "¿Algún comentario o necesidad específica? (Opcional)",
            submitButton: "Obtener Acceso Anticipado",
            successMessage: "¡Gracias por tu interés! Estaremos en contacto pronto.",
            errorMessage: "Algo salió mal. Por favor intenta de nuevo."
          }
        }
      }
    },
  });

// Update document direction when language changes
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

// Initialize document direction
updateDocumentDirection(i18n.language);

export default i18n;
