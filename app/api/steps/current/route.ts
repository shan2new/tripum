import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { getCardBySlug } from "@/lib/cards";
import { seedSteps } from "@/lib/seed-steps";
import { TripStepRow } from "@/lib/types";

export async function GET() {
  try {
    await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();
  let { data: rows, error } = await supabase
    .from("trip_steps")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!rows || rows.length === 0) {
    try {
      rows = await seedSteps(supabase);
    } catch (seedErr: any) {
      return NextResponse.json(
        { error: seedErr.message },
        { status: 500 }
      );
    }
  }

  const typedRows = rows as TripStepRow[];
  const activeRow =
    typedRows.find((r) => r.status === "active") ??
    typedRows.find((r) => r.status === "upcoming");

  if (!activeRow) {
    return NextResponse.json({ step: null, nextStep: null, done: true });
  }

  const card = getCardBySlug(activeRow.slug);
  const nextRow = typedRows.find(
    (r) => r.sort_order > activeRow.sort_order && r.status === "upcoming"
  );
  const nextCard = nextRow ? getCardBySlug(nextRow.slug) : null;

  return NextResponse.json({
    step: { card: card!, state: activeRow },
    nextStep: nextRow && nextCard ? { card: nextCard, state: nextRow } : null,
    done: false,
  });
}
