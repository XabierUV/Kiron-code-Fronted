import { NextRequest, NextResponse } from "next/server";
import { resolveBirthLocation } from "../../../lib/geocode";

type ChironSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

function buildPreview(sign: ChironSign, house: number) {
  const bySign: Record<ChironSign, { strengths: string; challenges: string; patterns: string }> = {
    Aries: {
      strengths: "Capacidad de iniciar procesos de sanación con valentía.",
      challenges: "Impaciencia cuando sientes que tu herida no se resuelve rápido.",
      patterns: "Tensión entre impulso personal y vulnerabilidad."
    },
    Taurus: {
      strengths: "Gran capacidad para construir estabilidad emocional con el tiempo.",
      challenges: "Miedo a perder seguridad o control.",
      patterns: "Aprendizajes repetidos sobre valor propio y apego."
    },
    Gemini: {
      strengths: "Talento para comprender y explicar heridas complejas con claridad.",
      challenges: "Dudas internas sobre si tu voz será comprendida.",
      patterns: "Heridas ligadas a comunicación, aprendizaje o validación mental."
    },
    Cancer: {
      strengths: "Profunda capacidad de cuidado y sensibilidad hacia los demás.",
      challenges: "Protección excesiva cuando te sientes emocionalmente expuesto.",
      patterns: "Temas repetidos en hogar, pertenencia y seguridad afectiva."
    },
    Leo: {
      strengths: "Potencial para inspirar a otros desde tu autenticidad.",
      challenges: "Dolor cuando no te sientes visto o reconocido.",
      patterns: "Búsqueda de validación y expresión personal."
    },
    Virgo: {
      strengths: "Capacidad de mejora, análisis y ayuda práctica muy fina.",
      challenges: "Exceso de exigencia contigo mismo.",
      patterns: "Heridas ligadas a perfección, utilidad o merecimiento."
    },
    Libra: {
      strengths: "Gran sensibilidad para equilibrar relaciones y conflictos.",
      challenges: "Dependencia de armonía externa para sentir paz interna.",
      patterns: "Aprendizajes repetidos en pareja, equilibrio y aprobación."
    },
    Scorpio: {
      strengths: "Capacidad transformadora muy intensa y profunda.",
      challenges: "Miedo a la pérdida, traición o exposición emocional.",
      patterns: "Procesos repetidos de crisis, control y regeneración."
    },
    Sagittarius: {
      strengths: "Talento para encontrar sentido en experiencias difíciles.",
      challenges: "Frustración cuando tus creencias no sostienen tu dolor.",
      patterns: "Aprendizajes sobre verdad, fe y dirección vital."
    },
    Capricorn: {
      strengths: "Gran fortaleza para construir estructura tras la herida.",
      challenges: "Rigidez o autoexigencia excesiva.",
      patterns: "Temas repetidos con responsabilidad, autoridad y logro."
    },
    Aquarius: {
      strengths: "Visión original para comprender tu proceso desde otra perspectiva.",
      challenges: "Sensación de no encajar o de ser distinto.",
      patterns: "Heridas relacionadas con grupo, identidad y distancia emocional."
    },
    Pisces: {
      strengths: "Sensibilidad espiritual y compasión muy desarrolladas.",
      challenges: "Confusión, escapismo o límites poco claros.",
      patterns: "Aprendizajes repetidos sobre entrega, fe y disolución del ego."
    }
  };

  const houseLine =
    house === 1 ? "Tu identidad y presencia personal son una parte clave del aprendizaje." :
    house === 2 ? "El valor propio y la seguridad material forman parte del proceso." :
    house === 3 ? "La comunicación y la expresión mental son un eje importante." :
    house === 4 ? "Las raíces, la familia y la seguridad emocional marcan este proceso." :
    house === 5 ? "La creatividad, el amor y la autoexpresión son áreas sensibles." :
    house === 6 ? "El trabajo diario, la salud y la autoexigencia toman protagonismo." :
    house === 7 ? "Las relaciones y vínculos cercanos activan este aprendizaje." :
    house === 8 ? "La intimidad, el control y la transformación profunda son centrales." :
    house === 9 ? "Las creencias, el sentido y la expansión personal están implicados." :
    house === 10 ? "La vocación, la imagen pública y la ambición son relevantes." :
    house === 11 ? "Los grupos, amistades y visión de futuro están implicados." :
    "El mundo interior, lo inconsciente y la sanación silenciosa son parte del proceso.";

  return {
    strengths: `${bySign[sign].strengths} ${houseLine}`,
    challenges: `${bySign[sign].challenges} ${houseLine}`,
    patterns: `${bySign[sign].patterns} ${houseLine}`
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthDate, birthTime, birthCity, birthCountry } = body;

    if (!birthDate || !birthTime || !birthCity || !birthCountry) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    const location = await resolveBirthLocation({
      birthCity,
      birthCountry
    });

    const chart = {
      chiron: {
        sign: "Gemini" as ChironSign,
        degree: 21.4,
        house: 7
      }
    };

    const preview = buildPreview(chart.chiron.sign, chart.chiron.house);

    return NextResponse.json({
      ok: true,
      location,
      chart,
      preview
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Chart generation failed." },
      { status: 500 }
    );
  }
}
