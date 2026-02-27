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

  return NextResponse.json(data?.completed ?? {});
}

export async function PUT(req: NextRequest) {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, completed } = await req.json();

  if (typeof id !== "string" || typeof completed !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("route_progress")
    .upsert(
      {
        id,
        completed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
