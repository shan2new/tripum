import { NextResponse } from "next/server";

// Rameshwaram coordinates
const LAT = 9.2876;
const LON = 79.3129;

export async function GET() {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(LAT));
    url.searchParams.set("longitude", String(LON));
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
    url.searchParams.set("timezone", "Asia/Kolkata");
    url.searchParams.set("forecast_days", "5");

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
