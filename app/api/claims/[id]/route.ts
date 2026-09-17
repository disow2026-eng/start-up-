import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const schema = z.object({
  status: z.enum(["DRAFT", "SENT", "ACKNOWLEDGED", "PAID", "DISPUTED", "REJECTED"]),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const claim = await prisma.claim.findUnique({ where: { id } });
  if (!claim || claim.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();
  await prisma.claim.update({
    where: { id: claim.id },
    data: {
      status: parsed.data.status,
      notes: parsed.data.notes ?? claim.notes,
      sentAt: parsed.data.status === "SENT" && !claim.sentAt ? now : claim.sentAt,
      paidAt: parsed.data.status === "PAID" ? now : claim.paidAt,
    },
  });

  return NextResponse.json({ ok: true });
}
