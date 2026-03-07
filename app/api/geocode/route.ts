import { NextRequest, NextResponse } from "next/server";
import { resolveBirthLocation } from "@/lib/geocode";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const birthCity = typeof body.birthCity === "string" ? body.birthCity : "";
    const birthCountry = typeof body.birthCountry === "string" ? body.birthCountry : "";

    if (!birthCity || !birthCountry) {
      return NextResponse.json(
        {
          ok: false,
          error: "birthCity and birthCountry are required."
        },
        { status: 400 }
      );
    }

    const location = await resolveBirthLocation({
      birthCity,
      birthCountry
    });

    return NextResponse.json({
      ok: true,
      location
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown geocoding error.";

    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      { status: 500 }
    );
  }
}
