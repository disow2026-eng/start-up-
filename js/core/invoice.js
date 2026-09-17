import { computeDetention } from "./detention.js";
import { formatCurrency } from "../lib/currency.js";
import { formatMinutes, formatDateTimeLong } from "../lib/time.js";

// Builds a display-ready view-model for the invoice page, keeping formatting
// decisions out of the page controller.
export function buildInvoiceViewModel({ load, claim, user }) {
  const detention = computeDetention(load);

  return {
    invoiceNumber: `DC-${load.referenceNumber}`,
    createdAt: formatDateTimeLong(claim.createdAt),
    companyName: user.companyName,
    mcNumber: user.mcNumber,
    brokerName: load.brokerName,
    brokerEmail: load.brokerEmail,
    loadReference: load.referenceNumber,
    route: `${load.shipperName} → ${load.receiverName}`,
    rows: [
      {
        stop: `Pickup — ${load.shipperName}`,
        arrived: formatDateTimeLong(load.pickupArrivedAt),
        departed: formatDateTimeLong(load.pickupDepartedAt),
        freeTime: formatHours(load.freeTimeMinutesPickup),
        billable: formatMinutes(detention.pickupDetentionMinutes),
      },
      {
        stop: `Delivery — ${load.receiverName}`,
        arrived: formatDateTimeLong(load.deliveryArrivedAt),
        departed: formatDateTimeLong(load.deliveryDepartedAt),
        freeTime: formatHours(load.freeTimeMinutesDelivery),
        billable: formatMinutes(detention.deliveryDetentionMinutes),
      },
    ],
    totalBillable: formatMinutes(detention.totalDetentionMinutes),
    rateLabel: `${formatCurrency(claim.ratePerHour)}/hr`,
    totalDue: formatCurrency(claim.amount),
  };
}

function formatHours(minutes) {
  const hours = minutes / 60;
  return `${hours.toFixed(2).replace(/\.?0+$/, "")}h`;
}
