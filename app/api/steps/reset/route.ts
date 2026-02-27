import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { seedSteps } from "@/lib/seed-steps";

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServerSupabase();

  // Delete all existing rows
  const { error: delErr } = await supabase
    .from("trip_steps")
    .delete()
    .neq("slug", "");

  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  // Re-seed
  try {
    const rows = await seedSteps(supabase);
    return NextResponse.json({ ok: true, steps: rows.length });
  } catch (seedErr: any) {
    return NextResponse.json({ error: seedErr.message }, { status: 500 });
  }
}
