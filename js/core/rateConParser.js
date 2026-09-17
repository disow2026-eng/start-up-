// Heuristic, regex-based parsing of pasted rate confirmation text.
//
// This is NOT AI. A static site with no server has nowhere safe to hold an
// API key — any key embedded in client-side JS is visible to every visitor
// via "view source" or the network tab, so calling a hosted LLM directly
// from here would leak it. Instead this does labeled-field pattern matching,
// which covers a lot of real rate confirmations (they're fairly formulaic)
// without needing a backend at all. It will miss fields on messy documents —
// that's expected, and the caller should treat every result as a starting
// point to double-check, not a guarantee.

function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return undefined;
}

function toMinutesFromHoursText(text) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\s*(?:of\s*)?free/i);
  if (match) return Math.round(parseFloat(match[1]) * 60);
  const minMatch = text.match(/(\d+)\s*(?:minutes?|mins?)\s*(?:of\s*)?free/i);
  if (minMatch) return parseInt(minMatch[1], 10);
  return undefined;
}

function toRatePerHour(text) {
  const match = text.match(/\$\s?(\d+(?:\.\d{1,2})?)\s*(?:\/|per)\s*(?:hr|hour)/i);
  return match ? parseFloat(match[1]) : undefined;
}

function toCityState(line) {
  const match = line?.match(/([A-Za-z .]+?),\s*([A-Z]{2})\b/);
  return match ? { city: match[1].trim(), state: match[2] } : {};
}

export function parseRateConfirmation(rawText) {
  const text = String(rawText || "");
  if (text.trim().length < 20) return {};

  const referenceNumber = firstMatch(text, [
    /\b(?:load|order|confirmation|ref(?:erence)?)\s*#?\s*:?\s*([A-Za-z0-9-]{3,20})/i,
  ]);

  const brokerEmail = firstMatch(text, [/([\w.+-]+@[\w-]+\.[\w.-]+)/]);

  const brokerName = firstMatch(text, [/\bbroker\s*:?\s*(.+)/i, /\bcarrier\s*to\s*:?\s*(.+)/i]);

  const shipperLine = firstMatch(text, [
    /\b(?:pickup|ship\s*from|shipper|origin)\s*:?\s*(.+)/i,
  ]);
  const receiverLine = firstMatch(text, [
    /\b(?:delivery|ship\s*to|consignee|receiver|destination)\s*:?\s*(.+)/i,
  ]);

  const shipperCityState = toCityState(shipperLine);
  const receiverCityState = toCityState(receiverLine);

  const freeTimeMinutes = toMinutesFromHoursText(text);
  const ratePerHour = toRatePerHour(text);

  return {
    referenceNumber,
    brokerName: brokerName ? brokerName.split(",")[0].trim() : undefined,
    brokerEmail,
    shipperName: shipperLine ? shipperLine.split(",")[0].trim() : undefined,
    shipperCity: shipperCityState.city,
    shipperState: shipperCityState.state,
    receiverName: receiverLine ? receiverLine.split(",")[0].trim() : undefined,
    receiverCity: receiverCityState.city,
    receiverState: receiverCityState.state,
    freeTimeMinutesPickup: freeTimeMinutes,
    freeTimeMinutesDelivery: freeTimeMinutes,
    ratePerHour,
  };
}
