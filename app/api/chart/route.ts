import { NextRequest, NextResponse } from "next/server";
import { resolveBirthLocation } from "../../../lib/geocode";

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

    // MVP: todavía no calculamos astrología real
    const chart = {
      chiron: {
        sign: "Gemini",
        degree: 21.4,
        house: 7
      }
    };

    return NextResponse.json({
      ok: true,
      location,
      chart
    });

  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Chart generation failed." },
      { status: 500 }
    );
  }
}
