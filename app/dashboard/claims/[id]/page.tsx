import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { computeDetention, formatCurrency, formatMinutes } from "@/lib/detention";
import { Badge, CLAIM_STATUS_TONE } from "@/components/ui/Badge";
import { ClaimActions } from "@/components/app/ClaimActions";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent to broker",
  ACKNOWLEDGED: "Acknowledged",
  PAID: "Paid",
  DISPUTED: "Disputed",
  REJECTED: "Rejected",
};

function fmt(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function ClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  const claim = await prisma.claim.findUnique({
    where: { id },
    include: { load: true, user: true },
  });

  if (!claim || claim.userId !== userId) notFound();

  const d = computeDetention(claim.load);
  const invoiceNumber = `DC-${claim.load.referenceNumber}`;

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/dashboard/claims" className="text-sm font-semibold text-ink-500 hover:text-ink-950">
          ← All claims
        </Link>
        <Badge tone={CLAIM_STATUS_TONE[claim.status]}>{STATUS_LABEL[claim.status]}</Badge>
      </div>

      <div className="card mt-4 p-8 sm:p-10 print:border-0 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 pb-6">
          <div>
            <p className="font-display text-lg font-bold text-ink-950">{claim.user.companyName}</p>
            {claim.user.mcNumber && <p className="text-sm text-ink-500">MC# {claim.user.mcNumber}</p>}
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-bold text-ink-950">Detention Invoice</p>
            <p className="text-sm text-ink-500">{invoiceNumber}</p>
            <p className="text-sm text-ink-500">{fmt(claim.createdAt)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Bill to</p>
            <p className="mt-1 font-semibold text-ink-950">{claim.load.brokerName}</p>
            {claim.load.brokerEmail && <p className="text-sm text-ink-500">{claim.load.brokerEmail}</p>}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Load reference</p>
            <p className="mt-1 font-semibold text-ink-950">#{claim.load.referenceNumber}</p>
            <p className="text-sm text-ink-500">
              {claim.load.shipperName} → {claim.load.receiverName}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Wait time detail</p>
          <div className="mt-3 overflow-hidden rounded-xl border border-ink-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-4 py-2.5 font-semibold">Stop</th>
                  <th className="px-4 py-2.5 font-semibold">Arrived</th>
                  <th className="px-4 py-2.5 font-semibold">Departed</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Free time</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Billable</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-ink-100">
                  <td className="px-4 py-3 font-medium text-ink-800">
                    Pickup — {claim.load.shipperName}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{fmt(claim.load.pickupArrivedAt)}</td>
                  <td className="px-4 py-3 text-ink-600">{fmt(claim.load.pickupDepartedAt)}</td>
                  <td className="px-4 py-3 text-right text-ink-600">
                    {(claim.load.freeTimeMinutesPickup / 60).toFixed(2).replace(/\.?0+$/, "")}h
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ink-950">
                    {formatMinutes(d.pickupDetentionMinutes)}
                  </td>
                </tr>
                <tr className="border-t border-ink-100">
                  <td className="px-4 py-3 font-medium text-ink-800">
                    Delivery — {claim.load.receiverName}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{fmt(claim.load.deliveryArrivedAt)}</td>
                  <td className="px-4 py-3 text-ink-600">{fmt(claim.load.deliveryDepartedAt)}</td>
                  <td className="px-4 py-3 text-right text-ink-600">
                    {(claim.load.freeTimeMinutesDelivery / 60).toFixed(2).replace(/\.?0+$/, "")}h
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ink-950">
                    {formatMinutes(d.deliveryDetentionMinutes)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>Total billable time</span>
              <span className="font-medium text-ink-950">{formatMinutes(d.totalDetentionMinutes)}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>Rate</span>
              <span className="font-medium text-ink-950">{formatCurrency(claim.ratePerHour)}/hr</span>
            </div>
            <div className="flex justify-between border-t border-ink-100 pt-2 text-base font-bold text-ink-950">
              <span>Total due</span>
              <span className="text-amber-600">{formatCurrency(claim.amount)}</span>
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-ink-100 pt-4 text-xs text-ink-400">
          Timestamps captured directly in DockClock at the time of arrival and departure. Detention
          calculated per the free time and rate terms on file for this load.
        </p>
      </div>

      <div className="mt-6">
        <ClaimActions claimId={claim.id} status={claim.status} />
      </div>
    </div>
  );
}
