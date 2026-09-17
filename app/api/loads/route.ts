import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const loadSchema = z.object({
  referenceNumber: z.string().min(1).max(80),
  brokerName: z.string().min(1).max(120),
  brokerEmail: z.string().email().optional().or(z.literal("")),
  shipperName: z.string().min(1).max(120),
  shipperCity: z.string().max(80).optional().or(z.literal("")),
  shipperState: z.string().max(20).optional().or(z.literal("")),
  receiverName: z.string().min(1).max(120),
  receiverCity: z.string().max(80).optional().or(z.literal("")),
  receiverState: z.string().max(20).optional().or(z.literal("")),
  freeTimeMinutesPickup: z.coerce.number().int().min(0).max(1440),
  freeTimeMinutesDelivery: z.coerce.number().int().min(0).max(1440),
  ratePerHour: z.coerce.number().min(0).max(1000),
  pickupAppointmentAt: z.string().optional().or(z.literal("")),
  deliveryAppointmentAt: z.string().optional().or(z.literal("")),
  rateConText: z.string().optional(),
});

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = loadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const d = parsed.data;

  const load = await prisma.load.create({
    data: {
      userId,
      referenceNumber: d.referenceNumber.trim(),
      brokerName: d.brokerName.trim(),
      brokerEmail: d.brokerEmail || null,
      shipperName: d.shipperName.trim(),
      shipperCity: d.shipperCity || null,
      shipperState: d.shipperState || null,
      receiverName: d.receiverName.trim(),
      receiverCity: d.receiverCity || null,
      receiverState: d.receiverState || null,
      freeTimeMinutesPickup: d.freeTimeMinutesPickup,
      freeTimeMinutesDelivery: d.freeTimeMinutesDelivery,
      ratePerHour: d.ratePerHour,
      pickupAppointmentAt: d.pickupAppointmentAt ? new Date(d.pickupAppointmentAt) : null,
      deliveryAppointmentAt: d.deliveryAppointmentAt ? new Date(d.deliveryAppointmentAt) : null,
      rateConText: d.rateConText || null,
    },
  });

  return NextResponse.json({ id: load.id });
}
