// Optional one-click demo data so a new signup isn't staring at an empty
// dashboard. Never runs automatically — only from an explicit button.

import { createLoad, logStopEvent } from "./loads.js";
import { generateOrUpdateClaimForLoad, setClaimStatus } from "./claims.js";
import { getLoad } from "./loads.js";
import { CLAIM_STATUS } from "./constants.js";
import { updateRow } from "./db.js";

function hoursAgo(h) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

export function seedDemoLoad(userId) {
  const load = createLoad(userId, {
    referenceNumber: "48213",
    brokerName: "Coyote Logistics",
    brokerEmail: "ops@coyote-example.com",
    shipperName: "Reyes Produce",
    shipperCity: "McAllen",
    shipperState: "TX",
    receiverName: "Midtown DC",
    receiverCity: "Dallas",
    receiverState: "TX",
    freeTimeMinutesPickup: 120,
    freeTimeMinutesDelivery: 120,
    ratePerHour: 50,
    pickupAppointmentAt: hoursAgo(148),
    deliveryAppointmentAt: hoursAgo(138),
  });

  // Backfill realistic past timestamps directly (bypassing "now" logic used
  // by logStopEvent, since this is historical demo data, not a live event).
  updateRow("loads", load.id, {
    pickupArrivedAt: hoursAgo(148),
    pickupDepartedAt: hoursAgo(148 - 3 - 40 / 60),
    deliveryArrivedAt: hoursAgo(138),
    deliveryDepartedAt: hoursAgo(138 - 4 - 5 / 60),
    status: "COMPLETED",
  });

  const finalLoad = getLoad(load.id);
  const claim = generateOrUpdateClaimForLoad(finalLoad);
  setClaimStatus(claim.id, CLAIM_STATUS.SENT);
  setClaimStatus(claim.id, CLAIM_STATUS.PAID);

  return finalLoad;
}
