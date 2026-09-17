"use client";

import { useEffect, useState } from "react";
import { formatMinutes } from "@/lib/detention";

export function LiveElapsed({
  arrivedAt,
  departedAt,
  freeTimeMinutes,
}: {
  arrivedAt: string | null;
  departedAt: string | null;
  freeTimeMinutes: number;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (departedAt || !arrivedAt) return;
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, [arrivedAt, departedAt]);

  if (!arrivedAt) {
    return (
      <div>
        <p className="text-xs text-ink-400">Wait time</p>
        <p className="font-display text-lg font-bold text-ink-300">—</p>
      </div>
    );
  }

  const end = departedAt ? new Date(departedAt).getTime() : now;
  const waitMinutes = Math.max(0, Math.round((end - new Date(arrivedAt).getTime()) / 60000));
  const detentionMinutes = Math.max(0, waitMinutes - freeTimeMinutes);
  const live = !departedAt;

  return (
    <div>
      <p className="text-xs text-ink-400">{live ? "Wait time (live)" : "Wait time"}</p>
      <p className={`font-display text-lg font-bold ${live ? "text-amber-600" : "text-ink-950"}`}>
        {formatMinutes(waitMinutes)}
      </p>
      {detentionMinutes > 0 && (
        <p className="text-xs font-semibold text-amber-600">{formatMinutes(detentionMinutes)} billable</p>
      )}
    </div>
  );
}
