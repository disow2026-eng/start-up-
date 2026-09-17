import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { aiExtractionAvailable } from "@/lib/anthropic";
import { NewLoadForm } from "@/components/app/NewLoadForm";

export default async function NewLoadPage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({ where: { id: userId! } });

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-ink-950">New load</h1>
      <p className="mt-1 text-sm text-ink-500">
        Paste your rate confirmation to auto-fill the details, or enter them by hand.
      </p>

      <NewLoadForm
        aiAvailable={aiExtractionAvailable()}
        defaults={{
          freeTimeMinutesPickup: user?.defaultFreeTimeMinutes ?? 120,
          freeTimeMinutesDelivery: user?.defaultFreeTimeMinutes ?? 120,
          ratePerHour: user?.defaultRatePerHour ?? 50,
        }}
      />
    </div>
  );
}
