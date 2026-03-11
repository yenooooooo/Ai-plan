import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** WMO Weather Code → 한국어 태그 매핑 */
const WMO_TO_TAG: Record<number, string> = {
  0: "맑음", 1: "맑음", 2: "흐림", 3: "흐림",
  45: "흐림", 48: "흐림",
  51: "비옴", 53: "비옴", 55: "비옴",
  56: "비옴", 57: "비옴",
  61: "비옴", 63: "비옴", 65: "비옴",
  66: "비옴", 67: "비옴",
  71: "눈/한파", 73: "눈/한파", 75: "눈/한파", 77: "눈/한파",
  80: "비옴", 81: "비옴", 82: "비옴",
  85: "눈/한파", 86: "눈/한파",
  95: "비옴", 96: "비옴", 99: "비옴",
};

export async function GET(request: Request) {
  // 인증 확인
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증 필요" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const date = searchParams.get("date");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat, lon 필요" }, { status: 400 });
  }

  try {
    const isHistorical = !!date;
    const url = isHistorical
      ? `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&start_date=${date}&end_date=${date}&timezone=Asia/Seoul`
      : `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia/Seoul`;

    const res = await fetch(url);
    const data = await res.json();

    if (isHistorical && data.daily) {
      const code = data.daily.weathercode[0];
      return NextResponse.json({
        tag: WMO_TO_TAG[code] ?? "흐림",
        tempMax: data.daily.temperature_2m_max[0],
        tempMin: data.daily.temperature_2m_min[0],
        code,
      });
    }

    if (data.current_weather) {
      const code = data.current_weather.weathercode;
      return NextResponse.json({
        tag: WMO_TO_TAG[code] ?? "흐림",
        temp: data.current_weather.temperature,
        code,
      });
    }

    return NextResponse.json({ tag: "흐림" });
  } catch {
    return NextResponse.json({ tag: "흐림" });
  }
}
