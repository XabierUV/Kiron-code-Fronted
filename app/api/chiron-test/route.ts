import { NextResponse } from "next/server";
import { calculateChiron } from "../../../lib/chiron";
import { toJulianDay } from "../../../lib/julian";

export async function GET() {
  try {
    const testDate = new Date("1990-05-12T14:32:00Z");
    const julianDay = toJulianDay(testDate);

    const chiron = calculateChiron(julianDay);

    return NextResponse.json({
      ok: true,
      julianDay,
      chiron
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
