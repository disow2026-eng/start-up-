import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { computeDetention, formatCurrency, formatMinutes } from "@/lib/detention";
import { Badge, LOAD_STATUS_LABEL, LOAD_STATUS_TONE } from "@/components/ui/Badge";

export default async function LoadsPage() {
  const userId = await requireUserId();
  const loads = await prisma.load.findMany({
    where: { userId: userId! },
    orderBy: { createdAt: "desc" },
  });
  const now = new Date();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950">Loads</h1>
          <p className="mt-1 text-sm text-ink-500">Every load you&apos;re clocking wait time on.</p>
        </div>
        <Link href="/dashboard/loads/new" className="btn-accent">
          + New load
        </Link>
      </div>

      {loads.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-ink-200 p-12 text-center">
          <p className="font-display font-semibold text-ink-800">No loads yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">
            Add a load to start logging arrival and departure times.
          </p>
          <Link href="/dashboard/loads/new" className="btn-accent mt-4 inline-flex">
            + New load
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {loads.map((load) => {
            const d = computeDetention(load, now);
            return (
              <Link
                key={load.id}
                href={`/dashboard/loads/${load.id}`}
                className="card flex flex-col gap-3 p-5 transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold text-ink-950">#{load.referenceNumber}</p>
                    <Badge tone={LOAD_STATUS_TONE[load.status]}>{LOAD_STATUS_LABEL[load.status]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    {load.brokerName} · {load.shipperName} → {load.receiverName}
                  </p>
                </div>
                <div className="flex items-center gap-6 sm:text-right">
                  <div>
                    <p className="text-xs text-ink-400">Detention so far</p>
                    <p className="font-display font-bold text-ink-950">{formatMinutes(d.totalDetentionMinutes)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400">Value</p>
                    <p className="font-display font-bold text-amber-600">{formatCurrency(d.amount)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
