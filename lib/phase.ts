import type { Phase } from "@/lib/events";

export const PHASE_LABELS: Record<Phase, string> = {
  upcoming: "Opens soon",
  open: "Open",
  closed: "Closed",
  over: "Over",
};
