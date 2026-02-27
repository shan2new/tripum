import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { getCardBySlug } from "@/lib/cards";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const card = getCardBySlug(slug);
  if (!card) {
    return NextResponse.json({ error: "Step not found" }, { status: 404 });
  }

  const body = await req.json();
  const { status, skip_reason } = body;

  if (status !== "done" && status !== "skipped") {
    return NextResponse.json(
      { error: "Status must be 'done' or 'skipped'" },
      { status: 400 }
    );
  }

  const supabase = createServerSupabase();
  const now = new Date().toISOString();

  // Update the target step
  const { error: updateErr } = await supabase
    .from("trip_steps")
    .update({
      status,
      completed_at: now,
      completed_by: userId,
      skip_reason: status === "skipped" ? (skip_reason ?? null) : null,
      updated_at: now,
    })
    .eq("slug", slug);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Advance the next upcoming step to active
  const { data: nextRows } = await supabase
    .from("trip_steps")
    .select("*")
    .eq("status", "upcoming")
    .order("sort_order", { ascending: true })
    .limit(1);

  if (nextRows && nextRows.length > 0) {
    await supabase
      .from("trip_steps")
      .update({ status: "active", updated_at: now })
      .eq("slug", nextRows[0].slug);
  }

  // Return updated step
  const { data: updated } = await supabase
    .from("trip_steps")
    .select("*")
    .eq("slug", slug)
    .single();

  return NextResponse.json({
    card,
    state: updated,
  });
}
