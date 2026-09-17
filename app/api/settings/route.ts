import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const schema = z.object({
  companyName: z.string().min(2).max(120),
  mcNumber: z.string().max(40).optional().or(z.literal("")),
  defaultFreeTimeMinutes: z.coerce.number().int().min(0).max(1440),
  defaultRatePerHour: z.coerce.number().min(0).max(1000),
});

export async function PATCH(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      companyName: parsed.data.companyName.trim(),
      mcNumber: parsed.data.mcNumber || null,
      defaultFreeTimeMinutes: parsed.data.defaultFreeTimeMinutes,
      defaultRatePerHour: parsed.data.defaultRatePerHour,
    },
  });

  return NextResponse.json({ ok: true });
}
