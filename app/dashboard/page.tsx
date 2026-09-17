import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeDetention, formatCurrency, formatMinutes } from "@/lib/detention";
import { Badge, LOAD_STATUS_LABEL, LOAD_STATUS_TONE } from "@/components/ui/Badge";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as { id: string }).id;

  const [loads, claims] = await Promise.all([
    prisma.load.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.claim.findMany({ where: { userId } }),
  ]);

  const now = new Date();
  const liveTotals = loads.map((load) => computeDetention(load, now));

  const totalDetentionMinutesEver = liveTotals.reduce((sum, d) => sum + d.totalDetentionMinutes, 0);
  const totalDetentionValueEver = liveTotals.reduce((sum, d) => sum + d.amount, 0);
  const recovered = claims.filter((c) => c.status === "PAID").reduce((sum, c) => sum + c.amount, 0);
  const pending = claims.filter((c) => c.status === "SENT" || c.status === "ACKNOWLEDGED");
  const pendingAmount = pending.reduce((sum, c) => sum + c.amount, 0);
  const activeLoads = loads.filter((l) => l.status !== "COMPLETED");
  const currentlyWaiting = loads.filter((l) => {
    const atPickup = l.pickupArrivedAt && !l.pickupDepartedAt;
    const atDelivery = l.deliveryArrivedAt && !l.deliveryDepartedAt;
    return atPickup || atDelivery;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950">Overview</h1>
          <p className="mt-1 text-sm text-ink-500">
            Every minute of wait time you&apos;ve logged, in one place.
          </p>
        </div>
        <Link href="/dashboard/loads/new" className="btn-accent">
          + New load
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Detention tracked (all-time)"
          value={formatCurrency(totalDetentionValueEver)}
          sub={formatMinutes(totalDetentionMinutesEver) + " of wait time"}
        />
        <StatCard label="Recovered" value={formatCurrency(recovered)} sub={`${claims.filter((c) => c.status === "PAID").length} claims paid`} tone="green" />
        <StatCard label="Pending on brokers" value={formatCurrency(pendingAmount)} sub={`${pending.length} invoices outstanding`} tone="amber" />
        <StatCard label="Active loads" value={String(activeLoads.length)} sub={`${currentlyWaiting.length} currently on the clock`} />
      </div>

      {currentlyWaiting.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-500">
            On the clock right now
          </h2>
          <div className="mt-3 space-y-3">
            {currentlyWaiting.map((load) => {
              const d = computeDetention(load, now);
              const atPickup = load.pickupArrivedAt && !load.pickupDepartedAt;
              return (
                <Link
                  key={load.id}
                  href={`/dashboard/loads/${load.id}`}
                  className="card flex items-center justify-between p-4 transition-transform hover:-translate-y-0.5"
                >
                  <div>
                    <p className="font-semibold text-ink-950">
                      #{load.referenceNumber} · {load.brokerName}
                    </p>
                    <p className="text-sm text-ink-500">
                      Waiting at {atPickup ? load.shipperName : load.receiverName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-bold text-amber-600">
                      {formatMinutes(atPickup ? d.pickupWaitMinutes : d.deliveryWaitMinutes)}
                    </p>
                    <p className="text-xs text-ink-400">elapsed</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-500">
            Recent loads
          </h2>
          <Link href="/dashboard/loads" className="text-sm font-semibold text-ink-950 hover:text-amber-600">
            View all →
          </Link>
        </div>

        {loads.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3 font-semibold">Load</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">Broker</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Detention</th>
                </tr>
              </thead>
              <tbody>
                {loads.slice(0, 6).map((load, i) => (
                  <tr key={load.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/loads/${load.id}`} className="font-semibold text-ink-950 hover:text-amber-600">
                        #{load.referenceNumber}
                      </Link>
                    </td>
                    <td className="hidden px-5 py-3 text-ink-600 sm:table-cell">{load.brokerName}</td>
                    <td className="px-5 py-3">
                      <Badge tone={LOAD_STATUS_TONE[load.status]}>{LOAD_STATUS_LABEL[load.status]}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-ink-950">
                      {formatCurrency(liveTotals[i].amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "default" | "green" | "amber";
}) {
  const valueColor = tone === "green" ? "text-emerald-600" : tone === "amber" ? "text-amber-600" : "text-ink-950";
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className={`mt-2 font-display text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="mt-1 text-xs text-ink-500">{sub}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-3 rounded-2xl border-2 border-dashed border-ink-200 p-10 text-center">
      <p className="font-display font-semibold text-ink-800">No loads yet</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">
        Add your next load and start the clock the moment you check in at the shipper.
      </p>
      <Link href="/dashboard/loads/new" className="btn-accent mt-4 inline-flex">
        + New load
      </Link>
    </div>
  );
}
