import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("route_progress")
    .select("completed")
    .eq("id", "rameshwaram-car-route")
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const raw = data?.completed;

  // Handle new format (versioned with metadata)
  if (raw && typeof raw === "object" && "_version" in raw) {
    return NextResponse.json({
      completed: raw.phases ?? {},
      completedAt: raw.completedAt ?? {},
      startTime: raw.startTime ?? null,
    });
  }

  // Old format (flat boolean map) — return with empty metadata
  return NextResponse.json({
    completed: raw ?? {},
    completedAt: {},
    startTime: null,
  });
}

export async function PUT(req: NextRequest) {
  try {
    await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, completed, completedAt, startTime } = body;

  if (typeof id !== "string") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Store in versioned format
  const storedData = {
    _version: 2,
    phases: completed ?? {},
    completedAt: completedAt ?? {},
    startTime: startTime ?? null,
  };

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("route_progress")
    .upsert(
      {
        id,
        completed: storedData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
