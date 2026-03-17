import type { Lang } from "@/types/chart";

export const copy = {
  es: {
    nav: {
      chart: "Carta",
      results: "Resultados",
      premium: "Productos",
      myChart: "Mi carta",
    },
    hero: {
      eyebrow: "Precisión astronómica. Diseño radical.",
      title: "Descubre tu mapa cósmico.",
      subtitle:
        "Quirón revela la herida que define tu potencial. Calculado con precisión astronómica real.",
      primaryCta: "Calcular mi Quirón",
    },
    form: {
      sectionLabel: "Tus datos de nacimiento",
      title: "El universo recuerda el momento exacto.",
      subtitle: "Fecha, hora y lugar de nacimiento.",
      name: "Nombre",
      birthDate: "Fecha de nacimiento",
      birthTime: "Hora de nacimiento",
      birthCity: "Ciudad de nacimiento",
      birthCountry: "País de nacimiento",
      submit: "Calcular mi Quirón",
      loading: "Generando...",
      helper:
        "Al continuar aceptas nuestra Política de Privacidad y el tratamiento de tus datos para generar tu carta natal. No compartimos tus datos con terceros.",
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
      title: "Aquí comienza tu camino.",
      subtitle: "Tu Quirón, calculado con precisión real.",
      previewTitle: "Adelanto",
      chironTitle: "Tu Quirón",
      sign: "Signo",
      degree: "Grado",
      house: "Casa",
      strengths: "Fortalezas",
      challenges: "Retos",
      patterns: "Patrones",
      fallbackStrengths: "Tu mayor fortaleza está donde menos la esperas.",
      fallbackChallenges: "El patrón que te frena tiene nombre.",
      fallbackPatterns: "Se repite. Siempre. Hasta que lo ves.",
      cta: "Quiero mi informe completo · 19€",
      location: "Ubicación resuelta",
    },
    premium: {
      sectionLabel: "Informe Quirón",
      title: "El informe que nadie más va a leer.",
      subtitle:
        "12 páginas. Tu herida. Tu patrón. Tu don. Escrito para ti.",
      features: [
        "La herida que llevas cargando desde la infancia",
        "Por qué se repite en tus relaciones y trabajo",
        "El don exacto que emerge cuando la sanas",
        "Tu camino de sanación personalizado",
      ],
      button: "Quiero La Herida y el Don · 19€",
      note: "Pago único. Sin suscripción.",
      price: "19€",
      checkoutTitle: "La Herida y el Don",
      checkoutMeta: "Pago único · Sin suscripción · Acceso inmediato",
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
      premium: "Products",
      myChart: "My chart",
    },
    hero: {
      eyebrow: "Astronomical precision. Radical design.",
      title: "Discover your cosmic map.",
      subtitle:
        "Chiron reveals the wound that defines your potential. Calculated with real astronomical precision.",
      primaryCta: "Calculate my Chiron",
    },
    form: {
      sectionLabel: "Your birth details",
      title: "Where it all began.",
      subtitle:
        "Exact date, time and place. That's how precise Chiron works.",
      name: "Name",
      birthDate: "Birth date",
      birthTime: "Birth time",
      birthCity: "Birth city",
      birthCountry: "Birth country",
      submit: "See my Chiron",
      loading: "Generating...",
      helper: "By continuing you accept our Privacy Policy and the processing of your data to generate your birth chart. We do not share your data with third parties.",
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
      title: "This is just the beginning.",
      subtitle:
        "A first reading of your Chiron. What comes next will change you.",
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
      cta: "I want my full report · €19",
      location: "Resolved location",
    },
    premium: {
      sectionLabel: "Chiron Report",
      title: "The report no one else will ever read.",
      subtitle:
        "12 pages. Your wound. Your pattern. Your gift. Written for you.",
      features: [
        "The wound you've been carrying since childhood",
        "Why it keeps repeating in your relationships and work",
        "The exact gift that emerges when you heal it",
        "Your personalized healing path",
      ],
      button: "I want The Wound and the Gift · €19",
      note: "One-time payment. No subscription.",
      price: "€19",
      checkoutTitle: "The Wound and the Gift",
      checkoutMeta: "One-time payment · No subscription · Instant access",
      alert: "Frontend only for now.",
    },
    footer: {
      text: "Your destiny, clearly explained.",
      rights: `© ${new Date().getFullYear()} Kiron Code. All rights reserved.`,
    },
  },
} satisfies Record<Lang, any>;
