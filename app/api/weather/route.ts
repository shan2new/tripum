import { NextRequest, NextResponse } from "next/server";

// Default: Rameshwaram coordinates
const DEFAULT_LAT = 9.2876;
const DEFAULT_LON = 79.3129;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const lat = parseFloat(searchParams.get("lat") ?? "") || DEFAULT_LAT;
    const lon = parseFloat(searchParams.get("lon") ?? "") || DEFAULT_LON;
    const compact = searchParams.get("compact") === "1";

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set("timezone", "Asia/Kolkata");

    if (compact) {
      // Lightweight payload for inline route weather
      url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");
      url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,weather_code");
      url.searchParams.set("forecast_days", "1");
    } else {
      url.searchParams.set("current", [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
      ].join(","));
      url.searchParams.set("hourly", "temperature_2m,weather_code");
      url.searchParams.set("daily", [
        "temperature_2m_max",
        "temperature_2m_min",
        "sunrise",
        "sunset",
        "uv_index_max",
        "weather_code",
      ].join(","));
      url.searchParams.set("forecast_days", "5");
    }

    const res = await fetch(url.toString(), { next: { revalidate: 900 } }); // cache 15 min
    if (!res.ok) {
      return NextResponse.json({ error: "Weather API error" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
