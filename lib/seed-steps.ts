import { SupabaseClient } from "@supabase/supabase-js";
import { CARDS } from "./cards";
import { TripStepRow } from "./types";

export async function seedSteps(
  supabase: SupabaseClient
): Promise<TripStepRow[]> {
  const rows = CARDS.map((card, i) => ({
    day_number: card.dayNumber,
    day_date: card.dayDate,
    sort_order: card.sortOrder,
    slug: card.slug,
    status: i === 0 ? "active" : ("upcoming" as const),
    skip_reason: null,
    completed_at: null,
    completed_by: null,
  }));

  const { data, error } = await supabase
    .from("trip_steps")
    .upsert(rows, { onConflict: "slug" })
    .select();

  if (error) throw error;
  return data as TripStepRow[];
}
