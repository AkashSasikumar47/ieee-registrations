"use client";

import { motion } from "motion/react";
import { DURATION, EASE_OUT } from "@/components/motion/timing";

export function CheckInProgress({
  arrived,
  total,
  compact = false,
}: {
  arrived: number;
  total: number;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-4">
        <p
          className={`font-display leading-none font-black tracking-[-0.05em] tabular-nums ${compact ? "text-3xl" : "text-5xl md:text-6xl"}`}
        >
          {arrived}
          <span className="text-muted-foreground"> / {total}</span>
        </p>
        <p className="font-mono text-xs text-muted-foreground uppercase">
          {total ? Math.round((arrived / total) * 100) : 0}% arrived
        </p>
      </div>
      <div className="h-1.5 bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${total ? (arrived / total) * 100 : 0}%` }}
          transition={{ duration: DURATION.collapse, ease: EASE_OUT }}
        />
      </div>
    </div>
  );
}
