"use client";

import { useState } from "react";

const ITEMS = [
  {
    q: "Will brokers actually pay these invoices?",
    a: "Detention pay is usually already written into the rate confirmation or broker-carrier agreement — you're owed it whether or not you invoice for it. DockClock just gives you a timestamped record and a clean invoice so the broker has no reasonable basis to argue the hours.",
  },
  {
    q: "What if I don't have a signed detention rate in writing?",
    a: "You can still log arrival and departure times and set a rate manually — many carriers use a standard rate (e.g. $50/hr after 2 hours) even without a specific clause, and having a documented ask strengthens any dispute. We recommend confirming detention terms before you accept a load.",
  },
  {
    q: "Do I need the AI feature to use DockClock?",
    a: "No. Every core feature — logging arrival/departure, calculating detention, generating invoices, and tracking payment status — works with zero AI involved. The AI rate-confirmation parser is an optional convenience that saves you re-typing details from a PDF.",
  },
  {
    q: "Can my dispatcher or team use this too?",
    a: "The Fleet plan adds multiple seats so a dispatcher can log times on a driver's behalf and track detention across the whole fleet from one dashboard.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto mt-10 max-w-2xl divide-y divide-ink-100">
      {ITEMS.map((item, i) => (
        <div key={item.q} className="py-5">
          <button
            className="flex w-full items-center justify-between text-left"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-display font-semibold text-ink-950">{item.q}</span>
            <span className={`ml-4 shrink-0 text-xl text-ink-400 transition-transform ${open === i ? "rotate-45" : ""}`}>
              +
            </span>
          </button>
          {open === i && <p className="mt-3 text-sm leading-relaxed text-ink-500">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
