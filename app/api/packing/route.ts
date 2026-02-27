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
  const { data: rows, error } = await supabase
    .from("packing_checks")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Shape: Record<list_key, Record<item_index, boolean>>
  const result: Record<string, Record<number, boolean>> = {};
  for (const row of rows ?? []) {
    if (!result[row.list_key]) result[row.list_key] = {};
    result[row.list_key][row.item_index] = row.checked;
  }

  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { list_key, item_index, checked } = await req.json();

  if (typeof list_key !== "string" || typeof item_index !== "number" || typeof checked !== "boolean") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("packing_checks")
    .upsert(
      {
        list_key,
        item_index,
        checked,
        checked_by: userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "list_key,item_index" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
