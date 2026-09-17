import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { formatCurrency, formatMinutes } from "@/lib/detention";
import { Badge, CLAIM_STATUS_TONE } from "@/components/ui/Badge";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  ACKNOWLEDGED: "Acknowledged",
  PAID: "Paid",
  DISPUTED: "Disputed",
  REJECTED: "Rejected",
};

export default async function ClaimsPage() {
  const userId = await requireUserId();
  const claims = await prisma.claim.findMany({
    where: { userId: userId! },
    include: { load: true },
    orderBy: { createdAt: "desc" },
  });

  const totalOutstanding = claims
    .filter((c) => c.status === "SENT" || c.status === "ACKNOWLEDGED")
    .reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = claims.filter((c) => c.status === "PAID").reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-ink-950">Detention claims</h1>
      <p className="mt-1 text-sm text-ink-500">Invoices generated from completed loads.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Outstanding</p>
          <p className="mt-1 font-display text-xl font-bold text-amber-600">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Recovered</p>
          <p className="mt-1 font-display text-xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      {claims.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-ink-200 p-12 text-center">
          <p className="font-display font-semibold text-ink-800">No claims yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">
            Claims are created automatically once a load&apos;s delivery departure is logged.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-semibold">Load</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Broker</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Detention</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/dashboard/claims/${claim.id}`}
                      className="font-semibold text-ink-950 hover:text-amber-600"
                    >
                      #{claim.load.referenceNumber}
                    </Link>
                  </td>
                  <td className="hidden px-5 py-3 text-ink-600 sm:table-cell">{claim.load.brokerName}</td>
                  <td className="hidden px-5 py-3 text-ink-600 sm:table-cell">
                    {formatMinutes(claim.totalDetentionMinutes)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={CLAIM_STATUS_TONE[claim.status]}>{STATUS_LABEL[claim.status]}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-ink-950">
                    {formatCurrency(claim.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
