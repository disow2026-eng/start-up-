import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { extractRateConfirmation, aiExtractionAvailable } from "@/lib/anthropic";

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!aiExtractionAvailable()) {
    return NextResponse.json({ error: "AI extraction is not configured" }, { status: 501 });
  }

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text : "";

  try {
    const result = await extractRateConfirmation(text);
    if (!result) {
      return NextResponse.json({ error: "Could not extract fields from that text" }, { status: 422 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "AI extraction failed. Please enter the load manually." }, { status: 502 });
  }
}
