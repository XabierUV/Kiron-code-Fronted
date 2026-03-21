import type { Lang } from "@/types/chart";

export const copy = {
  es: {
    nav: {
      chart: "Carta",
      results: "Resultados",
      premium: "Productos",
      myChart: "MI GALAXIA",
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
      sectionLabel: "ADELANTO DE LA HERIDA Y EL DON",
      title: "Aquí comienza tu camino.",
      subtitle: "Haz que tu herida se convierta en tu motor.",
      previewTitle: "Adelanto",
      chironTitle: "Tu Quirón",
      sign: "Signo",
      degree: "Grado",
      house: "Casa",
      strengths: "Tus Fortalezas",
      challenges: "Tus Retos",
      patterns: "Tus Patrones",
      fallbackStrengths: "Tu mayor fortaleza está donde menos la esperas.",
      fallbackChallenges: "El patrón que te frena tiene nombre.",
      fallbackPatterns: "Se repite. Siempre. Hasta que lo ves.",
      cta: "La Herida y el Don · 19€",
      location: "Ubicación resuelta",
    },
    premium: {
      sectionLabel: "Informe Quirón",
      title: "El informe que nadie más va a leer.",
      subtitle:
        "18 páginas. Tu herida. Tu patrón. Tu don. Escrito para ti.",
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
    products: {
      sectionLabel: "PRODUCTOS",
      title: "Elige tu camino.",
      subtitle: "Cada producto revela una capa más profunda de tu mapa.",
      items: [
        {
          name: "Tu Quirón",
          description: "Calculamos tu Quirón con precisión astronómica real. Signo, casa, grado. Tu rueda natal completa. El punto de partida de todo.",
          price: "INCLUIDO",
        },
        {
          name: "La Herida y el Don · 19€",
          description: "18 páginas que nombran lo que llevas años sintiendo sin poder explicarlo. Tu herida, cómo se formó, cómo se repite y el don que emerge cuando la sanas.",
          price: "19€ · PAGO ÚNICO",
        },
        {
          name: "Tu Mapa Interior · 39€",
          description: "Tu carta natal completa. Sol, Luna, Saturno, Nodo Norte y todos los aspectos que definen quién eres y hacia dónde vas. Incluye La Herida y el Don.",
          price: "39€ · PAGO ÚNICO",
        },
        {
          name: "El Vínculo · 59€",
          description: "Dos cartas comparadas. Por qué te enganchas a ciertas personas, qué activan en tu herida y qué pueden construir juntos.",
          price: "59€ · PAGO ÚNICO",
        },
        {
          name: "Kiron Vivo · 9€/mes",
          description: "Cada mes, un análisis personalizado de los tránsitos que afectan a tu carta. Contenido premium astrológico adaptado a ti.",
          price: "9€/MES · CANCELA CUANDO QUIERAS",
        },
      ],
    },
    faq: {
      sectionLabel: "FAQ",
      title: "Preguntas frecuentes.",
      items: [
        {
          q: "¿Qué es Quirón y por qué es importante?",
          a: "Quirón es un asteroide que en astrología psicológica representa la herida más profunda que llevamos, pero también el don que emerge cuando la trabajamos. No es magia — es un lenguaje para nombrar patrones que ya conoces de ti mismo.",
        },
        {
          q: "¿Necesito saber astrología para entender el informe?",
          a: "No. El informe está escrito en lenguaje psicológico, no esotérico. No necesitas ningún conocimiento previo de astrología.",
        },
        {
          q: "¿Cómo se genera mi informe?",
          a: "Calculamos tu carta natal con la mayor precisión astronómica existente. A partir de esos datos, generamos un informe personalizado único para tu combinación exacta de signo, casa y aspectos.",
        },
        {
          q: "¿Cuándo recibiré mi informe?",
          a: "En menos de 10 minutos tras el pago. Te llegará directamente a tu email en formato PDF.",
        },
        {
          q: "¿Es realmente personalizado?",
          a: "Sí. Cada informe se genera específicamente para tu carta natal — no es un texto genérico por signo solar. Usa los datos reales de tu fecha, hora y lugar exactos de nacimiento.",
        },
        {
          q: "¿Puedo acceder a mi informe más adelante?",
          a: "Sí. Desde MI GALAXIA puedes acceder siempre que quieras a todos tus informes con tu email.",
        },
      ],
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
      myChart: "MI GALAXIA",
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
      sectionLabel: "PREVIEW OF THE WOUND AND THE GIFT",
      title: "This is just the beginning.",
      subtitle: "Turn your Wound into your Gift.",
      previewTitle: "Preview",
      chironTitle: "Your Chiron",
      sign: "Sign",
      degree: "Degree",
      house: "House",
      strengths: "Your Strengths",
      challenges: "Your Challenges",
      patterns: "Your Patterns",
      fallbackStrengths:
        "Decisiveness when intuition and purpose align.",
      fallbackChallenges:
        "Timing matters: not everything is forced—destiny opens.",
      fallbackPatterns:
        "Recurring cycles across love, work, and major shifts.",
      cta: "The Wound and the Gift · €19",
      location: "Resolved location",
    },
    premium: {
      sectionLabel: "Chiron Report",
      title: "The report no one else will ever read.",
      subtitle:
        "18 pages. Your wound. Your pattern. Your gift. Written for you.",
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
    products: {
      sectionLabel: "PRODUCTS",
      title: "Choose your path.",
      subtitle: "Each product reveals a deeper layer of your map.",
      items: [
        {
          name: "Your Chiron",
          description: "We calculate your Chiron with real astronomical precision. Sign, house, degree. Your full natal wheel. The starting point of everything.",
          price: "INCLUDED",
        },
        {
          name: "The Wound and the Gift · €19",
          description: "18 pages that name what you've been feeling for years without being able to explain it. Your wound, how it formed, how it repeats and the gift that emerges when you heal it.",
          price: "€19 · ONE-TIME PAYMENT",
        },
        {
          name: "Your Inner Map · €39",
          description: "Your complete natal chart. Sun, Moon, Saturn, North Node and all the aspects that define who you are and where you're going. Includes The Wound and the Gift.",
          price: "€39 · ONE-TIME PAYMENT",
        },
        {
          name: "The Bond · €59",
          description: "Two charts compared. Why you get attached to certain people, what they activate in your wound and what you can build together.",
          price: "€59 · ONE-TIME PAYMENT",
        },
        {
          name: "Chiron Alive · €9/mo",
          description: "Monthly Chiron transits. What activates in you each month, when your moments of greatest growth are and how to navigate them.",
          price: "€9/MO · CANCEL ANYTIME",
        },
      ],
    },
    faq: {
      sectionLabel: "FAQ",
      title: "Frequently asked questions.",
      items: [
        {
          q: "What is Chiron and why does it matter?",
          a: "Chiron is an asteroid that in psychological astrology represents our deepest wound — and the gift that emerges when we work through it. It's not magic — it's a language for naming patterns you already know about yourself.",
        },
        {
          q: "Do I need to know astrology to understand the report?",
          a: "No. The report is written in psychological language, not esoteric terms. No prior knowledge of astrology is needed.",
        },
        {
          q: "How is my report generated?",
          a: "We calculate your birth chart with the highest astronomical precision in existence. From that data, we generate a unique personalised report for your exact combination of sign, house and aspects.",
        },
        {
          q: "When will I receive my report?",
          a: "Within 10 minutes of payment. It will be sent directly to your email as a PDF.",
        },
        {
          q: "Is it really personalised?",
          a: "Yes. Each report is generated specifically for your birth chart — not a generic sun sign text. It uses the real data from your exact date, time and place of birth.",
        },
        {
          q: "Can I access my report later?",
          a: "Yes. From MI GALAXIA you can access all your reports whenever you want using your email.",
        },
      ],
    },
    footer: {
      text: "Your destiny, clearly explained.",
      rights: `© ${new Date().getFullYear()} Kiron Code. All rights reserved.`,
    },
  },
} satisfies Record<Lang, any>;
