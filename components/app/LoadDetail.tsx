"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LiveElapsed } from "@/components/app/LiveElapsed";
import { formatCurrency, formatMinutes } from "@/lib/detention";
import { Badge, LOAD_STATUS_LABEL, LOAD_STATUS_TONE } from "@/components/ui/Badge";

export interface LoadDTO {
  id: string;
  referenceNumber: string;
  brokerName: string;
  brokerEmail: string | null;
  shipperName: string;
  shipperCity: string | null;
  shipperState: string | null;
  receiverName: string;
  receiverCity: string | null;
  receiverState: string | null;
  freeTimeMinutesPickup: number;
  freeTimeMinutesDelivery: number;
  ratePerHour: number;
  pickupAppointmentAt: string | null;
  pickupArrivedAt: string | null;
  pickupDepartedAt: string | null;
  deliveryAppointmentAt: string | null;
  deliveryArrivedAt: string | null;
  deliveryDepartedAt: string | null;
  status: string;
}

export interface ClaimDTO {
  id: string;
  status: string;
  amount: number;
  totalDetentionMinutes: number;
}

function fmt(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function LoadDetail({ load, claim }: { load: LoadDTO; claim: ClaimDTO | null }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function logTime(stop: "pickup" | "delivery", event: "arrive" | "depart") {
    setPending(`${stop}-${event}`);
    setError(null);
    try {
      const res = await fetch(`/api/loads/${load.id}/timestamp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stop, event }),
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

  const pickupDone = Boolean(load.pickupDepartedAt);
  const deliveryLocked = !pickupDone;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-ink-950">#{load.referenceNumber}</h1>
            <Badge tone={LOAD_STATUS_TONE[load.status]}>{LOAD_STATUS_LABEL[load.status]}</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-500">{load.brokerName}</p>
        </div>
        {claim && (
          <Link href={`/dashboard/claims/${claim.id}`} className="btn-outline">
            View invoice →
          </Link>
        )}
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Pickup</p>
          <p className="mt-1 font-display font-bold text-ink-950">{load.shipperName}</p>
          <p className="text-sm text-ink-500">
            {[load.shipperCity, load.shipperState].filter(Boolean).join(", ") || "—"}
          </p>
          {load.pickupAppointmentAt && (
            <p className="mt-1 text-xs text-ink-400">Appt: {fmt(load.pickupAppointmentAt)}</p>
          )}
          <p className="mt-1 text-xs text-ink-400">
            Free time: {(load.freeTimeMinutesPickup / 60).toFixed(2).replace(/\.?0+$/, "")}h
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
            <LiveElapsed
              arrivedAt={load.pickupArrivedAt}
              departedAt={load.pickupDepartedAt}
              freeTimeMinutes={load.freeTimeMinutesPickup}
            />
            {!load.pickupArrivedAt ? (
              <button
                className="btn-accent"
                disabled={pending === "pickup-arrive"}
                onClick={() => logTime("pickup", "arrive")}
              >
                {pending === "pickup-arrive" ? "Logging…" : "Log arrival"}
              </button>
            ) : !load.pickupDepartedAt ? (
              <button
                className="btn-primary"
                disabled={pending === "pickup-depart"}
                onClick={() => logTime("pickup", "depart")}
              >
                {pending === "pickup-depart" ? "Logging…" : "Log departure"}
              </button>
            ) : (
              <p className="text-xs font-semibold text-emerald-600">Departed {fmt(load.pickupDepartedAt)}</p>
            )}
          </div>
        </div>

        <div className={`card p-5 ${deliveryLocked ? "opacity-60" : ""}`}>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Delivery</p>
          <p className="mt-1 font-display font-bold text-ink-950">{load.receiverName}</p>
          <p className="text-sm text-ink-500">
            {[load.receiverCity, load.receiverState].filter(Boolean).join(", ") || "—"}
          </p>
          {load.deliveryAppointmentAt && (
            <p className="mt-1 text-xs text-ink-400">Appt: {fmt(load.deliveryAppointmentAt)}</p>
          )}
          <p className="mt-1 text-xs text-ink-400">
            Free time: {(load.freeTimeMinutesDelivery / 60).toFixed(2).replace(/\.?0+$/, "")}h
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
            <LiveElapsed
              arrivedAt={load.deliveryArrivedAt}
              departedAt={load.deliveryDepartedAt}
              freeTimeMinutes={load.freeTimeMinutesDelivery}
            />
            {deliveryLocked ? (
              <p className="text-xs text-ink-400">Complete pickup first</p>
            ) : !load.deliveryArrivedAt ? (
              <button
                className="btn-accent"
                disabled={pending === "delivery-arrive"}
                onClick={() => logTime("delivery", "arrive")}
              >
                {pending === "delivery-arrive" ? "Logging…" : "Log arrival"}
              </button>
            ) : !load.deliveryDepartedAt ? (
              <button
                className="btn-primary"
                disabled={pending === "delivery-depart"}
                onClick={() => logTime("delivery", "depart")}
              >
                {pending === "delivery-depart" ? "Logging…" : "Log departure"}
              </button>
            ) : (
              <p className="text-xs font-semibold text-emerald-600">Departed {fmt(load.deliveryDepartedAt)}</p>
            )}
          </div>
        </div>
      </div>

      {claim ? (
        <div className="card mt-6 flex items-center justify-between p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Detention claim</p>
            <p className="mt-1 font-display text-xl font-bold text-ink-950">{formatCurrency(claim.amount)}</p>
            <p className="text-sm text-ink-500">{formatMinutes(claim.totalDetentionMinutes)} billable</p>
          </div>
          <Link href={`/dashboard/claims/${claim.id}`} className="btn-accent">
            Manage invoice
          </Link>
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-ink-400">
          A detention invoice will be generated automatically once delivery is complete.
        </p>
      )}
    </div>
  );
}
