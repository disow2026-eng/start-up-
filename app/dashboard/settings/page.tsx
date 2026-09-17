import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { SettingsForm } from "@/components/app/SettingsForm";
import { aiExtractionAvailable } from "@/lib/anthropic";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({ where: { id: userId! } });
  if (!user) return null;

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-ink-950">Settings</h1>
      <p className="mt-1 text-sm text-ink-500">Your company info and default detention terms.</p>

      <SettingsForm
        initial={{
          companyName: user.companyName,
          mcNumber: user.mcNumber ?? "",
          defaultFreeTimeHours: String(user.defaultFreeTimeMinutes / 60),
          defaultRatePerHour: String(user.defaultRatePerHour),
        }}
      />

      <div className="card mt-6 max-w-lg p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-400">AI rate confirmation parsing</p>
        <p className="mt-2 text-sm text-ink-600">
          {aiExtractionAvailable()
            ? "Enabled — the New Load screen can auto-fill fields from a pasted rate confirmation."
            : "Not configured. Set an ANTHROPIC_API_KEY in your environment to enable AI-assisted rate confirmation parsing. Every core feature works without it."}
        </p>
      </div>
    </div>
  );
}
