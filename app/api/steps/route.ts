import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { getCardBySlug } from "@/lib/cards";
import { seedSteps } from "@/lib/seed-steps";
import { StepViewModel, TripStepRow } from "@/lib/types";

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

  const viewModels: StepViewModel[] = (rows as TripStepRow[]).map((row) => {
    const card = getCardBySlug(row.slug);
    return { card: card!, state: row };
  });

  return NextResponse.json(viewModels);
}
