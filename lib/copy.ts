import type { Lang } from "@/types/chart";

export const copy = {
  es: {
    nav: {
      chart: "Carta",
      results: "Resultados",
      premium: "Premium",
    },
    hero: {
      eyebrow: "Precisión astronómica. Diseño radical.",
      title: "Descubre tu mapa cósmico.",
      subtitle:
        "Kiron Code interpreta tu nacimiento con una experiencia visual limpia, intensa y pensada para revelar patrones reales.",
      primaryCta: "Generar carta",
    },
    form: {
      sectionLabel: "Datos de nacimiento",
      title: "Introduce tus datos.",
      subtitle:
        "Fecha, hora, ciudad y país de nacimiento. Con eso generamos tu vista previa.",
      name: "Nombre",
      birthDate: "Fecha de nacimiento",
      birthTime: "Hora de nacimiento",
      birthCity: "Ciudad de nacimiento",
      birthCountry: "País de nacimiento",
      submit: "Ver mi Kiron Code",
      loading: "Generando...",
      helper:
        "Al continuar aceptas nuestras condiciones y política de privacidad.",
      placeholders: {
        name: "Tu nombre",
        city: "Ej. Bilbao",
        country: "Ej. España",
      },
      validation: "Completa todos los campos para continuar.",
      genericError: "Ha ocurrido un error inesperado.",
      success: "Kiron Code generado correctamente.",
    },
    results: {
      sectionLabel: "Vista previa",
      title: "Tu primera lectura.",
      subtitle:
        "Una lectura inicial de Quirón y tres ejes clave para empezar a entender tu patrón.",
      previewTitle: "Adelanto",
      chironTitle: "Tu Quirón",
      sign: "Signo",
      degree: "Grado",
      house: "Casa",
      strengths: "Fortalezas",
      challenges: "Retos",
      patterns: "Patrones",
      fallbackStrengths:
        "Capacidad de decisión cuando alineas intuición y propósito.",
      fallbackChallenges:
        "Elegir el momento: no todo se fuerza, el destino se abre.",
      fallbackPatterns:
        "Ciclos que se repiten en amor, trabajo y cambios importantes.",
      cta: "Desbloquear informe completo",
      location: "Ubicación resuelta",
    },
    premium: {
      sectionLabel: "Premium",
      title: "Desbloquea el informe completo.",
      subtitle:
        "Una interpretación más profunda, clara y diseñada para releerse en los momentos importantes.",
      features: [
        "Análisis completo de carta natal",
        "Lectura estructurada de rasgos y talentos",
        "Ciclos vitales y momentos de cambio",
        "Compatibilidad: vínculos, amor y carrera",
      ],
      button: "Pasar a Premium",
      note: "Pago único. Sin suscripción.",
      price: "19€",
      checkoutTitle: "Premium",
      checkoutMeta: "Seguro · Rápido · Acceso inmediato",
      alert: "Solo frontend por ahora.",
    },
    footer: {
      text: "Tu destino, explicado con claridad.",
      rights: `© ${new Date().getFullYear()} Kiron Code. Todos los derechos reservados.`,
    },
  },
  en: {
    nav: {
      chart: "Chart",
      results: "Results",
      premium: "Premium",
    },
    hero: {
      eyebrow: "Astronomical precision. Radical design.",
      title: "Discover your cosmic blueprint.",
      subtitle:
        "Kiron Code interprets your birth through a clean, intense visual experience built to reveal real patterns.",
      primaryCta: "Generate chart",
    },
    form: {
      sectionLabel: "Birth data",
      title: "Enter your details.",
      subtitle:
        "Birth date, time, city and country. With that, we generate your preview.",
      name: "Name",
      birthDate: "Birth date",
      birthTime: "Birth time",
      birthCity: "Birth city",
      birthCountry: "Birth country",
      submit: "See my Kiron Code",
      loading: "Generating...",
      helper: "By continuing you agree to our terms and privacy policy.",
      placeholders: {
        name: "Your name",
        city: "e.g. Bilbao",
        country: "e.g. Spain",
      },
      validation: "Please complete all fields to continue.",
      genericError: "An unexpected error occurred.",
      success: "Kiron Code generated successfully.",
    },
    results: {
      sectionLabel: "Preview",
      title: "Your first reading.",
      subtitle:
        "An initial Chiron reading and three key axes to begin understanding your pattern.",
      previewTitle: "Preview",
      chironTitle: "Your Chiron",
      sign: "Sign",
      degree: "Degree",
      house: "House",
      strengths: "Strengths",
      challenges: "Challenges",
      patterns: "Patterns",
      fallbackStrengths:
        "Decisiveness when intuition and purpose align.",
      fallbackChallenges:
        "Timing matters: not everything is forced—destiny opens.",
      fallbackPatterns:
        "Recurring cycles across love, work, and major shifts.",
      cta: "Unlock full report",
      location: "Resolved location",
    },
    premium: {
      sectionLabel: "Premium",
      title: "Unlock the full report.",
      subtitle:
        "A deeper interpretation, clear and designed to be revisited in the moments that matter.",
      features: [
        "Full natal chart analysis",
        "Structured reading of traits and talents",
        "Life cycles and turning points",
        "Compatibility: relationships, love and career",
      ],
      button: "Upgrade to Premium",
      note: "One-time payment. No subscription.",
      price: "€19",
      checkoutTitle: "Premium",
      checkoutMeta: "Secure · Fast · Instant access",
      alert: "Frontend only for now.",
    },
    footer: {
      text: "Your destiny, clearly explained.",
      rights: `© ${new Date().getFullYear()} Kiron Code. All rights reserved.`,
    },
  },
} satisfies Record<Lang, any>;