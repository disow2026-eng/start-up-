import Anthropic from "@anthropic-ai/sdk";

export interface ExtractedRateConfirmation {
  referenceNumber?: string;
  brokerName?: string;
  brokerEmail?: string;
  shipperName?: string;
  shipperCity?: string;
  shipperState?: string;
  receiverName?: string;
  receiverCity?: string;
  receiverState?: string;
  freeTimeMinutesPickup?: number;
  freeTimeMinutesDelivery?: number;
  ratePerHour?: number;
  pickupAppointmentAt?: string;
  deliveryAppointmentAt?: string;
}

export function aiExtractionAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM_PROMPT = `You read freight rate confirmations (the document a broker sends an owner-operator or carrier confirming a load) and pull out the fields a detention-tracking app needs. Rate confirmations are inconsistently formatted free text, emails, or OCR'd PDFs - infer sensibly from whatever structure is present.

Respond with ONLY a single JSON object, no prose, no markdown fences, matching this shape exactly (omit a key entirely if the document does not state it - never guess a value that is not supported by the text):

{
  "referenceNumber": string,       // load/order/confirmation number
  "brokerName": string,
  "brokerEmail": string,
  "shipperName": string,           // pickup location name
  "shipperCity": string,
  "shipperState": string,          // two-letter state code
  "receiverName": string,          // delivery location name
  "receiverCity": string,
  "receiverState": string,
  "freeTimeMinutesPickup": number, // convert hours to minutes, e.g. "2 hours free time" -> 120
  "freeTimeMinutesDelivery": number,
  "ratePerHour": number,           // detention/accessorial rate in USD per hour, digits only
  "pickupAppointmentAt": string,   // ISO 8601 datetime if a specific date+time is given
  "deliveryAppointmentAt": string  // ISO 8601 datetime if a specific date+time is given
}

If the document only states one free-time or detention-rate figure that clearly applies to both stops, use it for both freeTime fields / ratePerHour. If a date has no explicit year, assume the current year given in the note below.`;

export async function extractRateConfirmation(
  rawText: string
): Promise<ExtractedRateConfirmation | null> {
  if (!aiExtractionAvailable()) return null;
  if (!rawText || rawText.trim().length < 20) return null;

  const client = new Anthropic();
  const today = new Date().toISOString().slice(0, 10);

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Today's date is ${today}.\n\nRate confirmation text:\n"""\n${rawText.slice(0, 12000)}\n"""`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") return null;

  const jsonText = textBlock.text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(jsonText) as ExtractedRateConfirmation;
    return parsed;
  } catch {
    return null;
  }
}
