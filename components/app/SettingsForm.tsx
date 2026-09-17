"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Defaults {
  companyName: string;
  mcNumber: string;
  defaultFreeTimeHours: string;
  defaultRatePerHour: string;
}

export function SettingsForm({ initial }: { initial: Defaults }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          mcNumber: form.mcNumber,
          defaultFreeTimeMinutes: Math.round(parseFloat(form.defaultFreeTimeHours || "0") * 60),
          defaultRatePerHour: parseFloat(form.defaultRatePerHour || "0"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 max-w-lg space-y-4 p-6">
      <div>
        <label className="label">Company / driver name</label>
        <input
          className="input"
          value={form.companyName}
          onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="label">MC number (optional)</label>
        <input
          className="input"
          value={form.mcNumber}
          onChange={(e) => setForm((f) => ({ ...f, mcNumber: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Default free time (hours)</label>
          <input
            className="input"
            type="number"
            step="0.25"
            value={form.defaultFreeTimeHours}
            onChange={(e) => setForm((f) => ({ ...f, defaultFreeTimeHours: e.target.value }))}
          />
        </div>
        <div>
          <label className="label">Default rate ($/hr)</label>
          <input
            className="input"
            type="number"
            step="0.01"
            value={form.defaultRatePerHour}
            onChange={(e) => setForm((f) => ({ ...f, defaultRatePerHour: e.target.value }))}
          />
        </div>
      </div>
      <p className="text-xs text-ink-400">
        These pre-fill every new load — override them per load whenever a rate confirmation says otherwise.
      </p>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-accent" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <p className="text-sm text-emerald-600">Saved.</p>}
      </div>
    </form>
  );
}
