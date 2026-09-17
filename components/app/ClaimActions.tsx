"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TRANSITIONS: Record<string, { label: string; next: string; tone: "primary" | "accent" | "outline" }[]> = {
  DRAFT: [{ label: "Mark as sent to broker", next: "SENT", tone: "accent" }],
  SENT: [
    { label: "Mark as paid", next: "PAID", tone: "accent" },
    { label: "Mark as disputed", next: "DISPUTED", tone: "outline" },
  ],
  ACKNOWLEDGED: [
    { label: "Mark as paid", next: "PAID", tone: "accent" },
    { label: "Mark as disputed", next: "DISPUTED", tone: "outline" },
  ],
  DISPUTED: [
    { label: "Mark as paid", next: "PAID", tone: "accent" },
    { label: "Mark as rejected", next: "REJECTED", tone: "outline" },
  ],
  PAID: [],
  REJECTED: [{ label: "Reopen as sent", next: "SENT", tone: "outline" }],
};

export function ClaimActions({ claimId, status }: { claimId: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(next: string) {
    setPending(next);
    setError(null);
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(null);
    }
  }

  const options = TRANSITIONS[status] ?? [];

  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      {options.map((opt) => (
        <button
          key={opt.next}
          onClick={() => setStatus(opt.next)}
          disabled={pending === opt.next}
          className={opt.tone === "accent" ? "btn-accent" : opt.tone === "primary" ? "btn-primary" : "btn-outline"}
        >
          {pending === opt.next ? "Updating…" : opt.label}
        </button>
      ))}
      <button onClick={() => window.print()} className="btn-ghost">
        Print / Save PDF
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
