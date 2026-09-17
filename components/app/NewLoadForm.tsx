"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Defaults {
  freeTimeMinutesPickup: number;
  freeTimeMinutesDelivery: number;
  ratePerHour: number;
}

interface FormState {
  referenceNumber: string;
  brokerName: string;
  brokerEmail: string;
  shipperName: string;
  shipperCity: string;
  shipperState: string;
  receiverName: string;
  receiverCity: string;
  receiverState: string;
  freeTimeHoursPickup: string;
  freeTimeHoursDelivery: string;
  ratePerHour: string;
  pickupAppointmentAt: string;
  deliveryAppointmentAt: string;
}

function toLocalDatetimeInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function NewLoadForm({ aiAvailable, defaults }: { aiAvailable: boolean; defaults: Defaults }) {
  const router = useRouter();
  const [rateConText, setRateConText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedOk, setExtractedOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    referenceNumber: "",
    brokerName: "",
    brokerEmail: "",
    shipperName: "",
    shipperCity: "",
    shipperState: "",
    receiverName: "",
    receiverCity: "",
    receiverState: "",
    freeTimeHoursPickup: String(defaults.freeTimeMinutesPickup / 60),
    freeTimeHoursDelivery: String(defaults.freeTimeMinutesDelivery / 60),
    ratePerHour: String(defaults.ratePerHour),
    pickupAppointmentAt: "",
    deliveryAppointmentAt: "",
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleExtract() {
    setExtracting(true);
    setExtractError(null);
    setExtractedOk(false);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rateConText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setExtractError(data.error ?? "Could not extract fields");
        return;
      }
      setForm((f) => ({
        ...f,
        referenceNumber: data.referenceNumber ?? f.referenceNumber,
        brokerName: data.brokerName ?? f.brokerName,
        brokerEmail: data.brokerEmail ?? f.brokerEmail,
        shipperName: data.shipperName ?? f.shipperName,
        shipperCity: data.shipperCity ?? f.shipperCity,
        shipperState: data.shipperState ?? f.shipperState,
        receiverName: data.receiverName ?? f.receiverName,
        receiverCity: data.receiverCity ?? f.receiverCity,
        receiverState: data.receiverState ?? f.receiverState,
        freeTimeHoursPickup:
          data.freeTimeMinutesPickup != null ? String(data.freeTimeMinutesPickup / 60) : f.freeTimeHoursPickup,
        freeTimeHoursDelivery:
          data.freeTimeMinutesDelivery != null ? String(data.freeTimeMinutesDelivery / 60) : f.freeTimeHoursDelivery,
        ratePerHour: data.ratePerHour != null ? String(data.ratePerHour) : f.ratePerHour,
        pickupAppointmentAt: toLocalDatetimeInput(data.pickupAppointmentAt) || f.pickupAppointmentAt,
        deliveryAppointmentAt: toLocalDatetimeInput(data.deliveryAppointmentAt) || f.deliveryAppointmentAt,
      }));
      setExtractedOk(true);
    } catch {
      setExtractError("Network error while extracting. Try again or enter manually.");
    } finally {
      setExtracting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/loads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNumber: form.referenceNumber,
          brokerName: form.brokerName,
          brokerEmail: form.brokerEmail,
          shipperName: form.shipperName,
          shipperCity: form.shipperCity,
          shipperState: form.shipperState,
          receiverName: form.receiverName,
          receiverCity: form.receiverCity,
          receiverState: form.receiverState,
          freeTimeMinutesPickup: Math.round(parseFloat(form.freeTimeHoursPickup || "0") * 60),
          freeTimeMinutesDelivery: Math.round(parseFloat(form.freeTimeHoursDelivery || "0") * 60),
          ratePerHour: parseFloat(form.ratePerHour || "0"),
          pickupAppointmentAt: form.pickupAppointmentAt,
          deliveryAppointmentAt: form.deliveryAppointmentAt,
          rateConText: rateConText || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong");
        setSubmitting(false);
        return;
      }
      router.push(`/dashboard/loads/${data.id}`);
      router.refresh();
    } catch {
      setSubmitError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {aiAvailable && (
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <span className="badge bg-amber-100 text-amber-700">AI-assisted</span>
            <p className="text-sm font-semibold text-ink-800">Paste your rate confirmation</p>
          </div>
          <textarea
            className="input mt-3 min-h-[120px] font-mono text-xs"
            placeholder="Paste the email or PDF text of your rate confirmation here…"
            value={rateConText}
            onChange={(e) => setRateConText(e.target.value)}
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={handleExtract}
              disabled={extracting || rateConText.trim().length < 20}
              className="btn-outline"
            >
              {extracting ? "Reading document…" : "✨ Extract details"}
            </button>
            {extractedOk && <p className="text-sm text-emerald-600">Fields filled in below — check them over.</p>}
            {extractError && <p className="text-sm text-red-600">{extractError}</p>}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6 p-6">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-400">Load details</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Load / reference #" value={form.referenceNumber} onChange={(v) => update("referenceNumber", v)} required />
            <Field label="Broker name" value={form.brokerName} onChange={(v) => update("brokerName", v)} required />
            <Field
              label="Broker email (for invoicing)"
              type="email"
              value={form.brokerEmail}
              onChange={(v) => update("brokerEmail", v)}
              span2
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-400">Pickup (shipper)</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Shipper name" value={form.shipperName} onChange={(v) => update("shipperName", v)} required span2 />
            <Field label="City" value={form.shipperCity} onChange={(v) => update("shipperCity", v)} />
            <Field label="State" value={form.shipperState} onChange={(v) => update("shipperState", v)} />
            <Field
              label="Appointment"
              type="datetime-local"
              value={form.pickupAppointmentAt}
              onChange={(v) => update("pickupAppointmentAt", v)}
              span2
            />
            <Field
              label="Free time (hours)"
              type="number"
              step="0.25"
              value={form.freeTimeHoursPickup}
              onChange={(v) => update("freeTimeHoursPickup", v)}
              span2
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-400">Delivery (receiver)</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Receiver name" value={form.receiverName} onChange={(v) => update("receiverName", v)} required span2 />
            <Field label="City" value={form.receiverCity} onChange={(v) => update("receiverCity", v)} />
            <Field label="State" value={form.receiverState} onChange={(v) => update("receiverState", v)} />
            <Field
              label="Appointment"
              type="datetime-local"
              value={form.deliveryAppointmentAt}
              onChange={(v) => update("deliveryAppointmentAt", v)}
              span2
            />
            <Field
              label="Free time (hours)"
              type="number"
              step="0.25"
              value={form.freeTimeHoursDelivery}
              onChange={(v) => update("freeTimeHoursDelivery", v)}
              span2
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-400">Detention rate</p>
          <Field
            label="Rate per hour ($)"
            type="number"
            step="0.01"
            value={form.ratePerHour}
            onChange={(v) => update("ratePerHour", v)}
            required
          />
        </div>

        {submitError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}

        <button type="submit" className="btn-accent w-full" disabled={submitting}>
          {submitting ? "Creating load…" : "Create load"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  step,
  required,
  span2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
  required?: boolean;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <label className="label">{label}</label>
      <input
        className="input"
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
