export type StepStatus = "upcoming" | "active" | "done" | "skipped";

export type Language = "en" | "hi";

export interface BilingualText {
  en: string;
  hi: string;
}

export interface StepCard {
  slug: string;
  dayNumber: number;
  dayDate: string;
  sortOrder: number;
  title: BilingualText;
  subtitle: BilingualText;
  timeWindow: string;
  durationMin: number;
  icon: string;
  heroImage: string;
  tip: BilingualText;
  carry: BilingualText[];
  skipAllowed: boolean;
  skipConsequence: BilingualText | null;
  nextSlug: string | null;
  phase: string | null;
}

export interface TripStepRow {
  id: string;
  day_number: number;
  day_date: string;
  sort_order: number;
  slug: string;
  status: StepStatus;
  skip_reason: string | null;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StepViewModel {
  card: StepCard;
  state: TripStepRow;
}

export type UserRole = "admin" | "viewer";
