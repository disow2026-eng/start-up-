import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { computeDetention } from "@/lib/detention";

const schema = z.object({
  stop: z.enum(["pickup", "delivery"]),
  event: z.enum(["arrive", "depart"]),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const load = await prisma.load.findUnique({ where: { id } });
  if (!load || load.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { stop, event } = parsed.data;
  const now = new Date();
  const field = `${stop}${event === "arrive" ? "ArrivedAt" : "DepartedAt"}` as
    | "pickupArrivedAt"
    | "pickupDepartedAt"
    | "deliveryArrivedAt"
    | "deliveryDepartedAt";

  if (event === "depart" && !load[field.replace("Departed", "Arrived") as "pickupArrivedAt" | "deliveryArrivedAt"]) {
    return NextResponse.json({ error: `Log the ${stop} arrival before departure` }, { status: 400 });
  }

  let status = load.status;
  if (stop === "pickup" && event === "arrive") status = "AT_PICKUP";
  if (stop === "pickup" && event === "depart") status = "IN_TRANSIT";
  if (stop === "delivery" && event === "arrive") status = "AT_DELIVERY";
  if (stop === "delivery" && event === "depart") status = "COMPLETED";

  const updated = await prisma.load.update({
    where: { id: load.id },
    data: { [field]: now, status },
  });

  if (stop === "delivery" && event === "depart") {
    const d = computeDetention(updated, now);
    await prisma.claim.upsert({
      where: { loadId: updated.id },
      update: {
        pickupDetentionMinutes: d.pickupDetentionMinutes,
        deliveryDetentionMinutes: d.deliveryDetentionMinutes,
        totalDetentionMinutes: d.totalDetentionMinutes,
        ratePerHour: updated.ratePerHour,
        amount: d.amount,
      },
      create: {
        loadId: updated.id,
        userId,
        pickupDetentionMinutes: d.pickupDetentionMinutes,
        deliveryDetentionMinutes: d.deliveryDetentionMinutes,
        totalDetentionMinutes: d.totalDetentionMinutes,
        ratePerHour: updated.ratePerHour,
        amount: d.amount,
        status: "DRAFT",
      },
    });
  }

  return NextResponse.json({ ok: true });
}
