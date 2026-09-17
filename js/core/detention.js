// The core of the product: a shipper/receiver grants a fixed amount of
// "free time" to load or unload a truck. Every minute a driver waits beyond
// that is billable "detention" time, at the rate set on the load. Pure
// functions only — no DOM, no storage — so this is trivially testable.

import { round2 } from "../lib/currency.js";

export function stopWaitMinutes(arrivedAtIso, departedAtIso, now = new Date()) {
  if (!arrivedAtIso) return 0;
  const start = new Date(arrivedAtIso);
  const end = departedAtIso ? new Date(departedAtIso) : now;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

export function stopDetentionMinutes(arrivedAtIso, departedAtIso, freeTimeMinutes, now = new Date()) {
  const wait = stopWaitMinutes(arrivedAtIso, departedAtIso, now);
  return Math.max(0, wait - freeTimeMinutes);
}

/**
 * @param {object} load
 * @param {Date} [now]
 * @returns {{pickupWaitMinutes:number, pickupDetentionMinutes:number, deliveryWaitMinutes:number, deliveryDetentionMinutes:number, totalDetentionMinutes:number, amount:number, isFinal:boolean}}
 */
export function computeDetention(load, now = new Date()) {
  const pickupWaitMinutes = stopWaitMinutes(load.pickupArrivedAt, load.pickupDepartedAt, now);
  const pickupDetentionMinutes = stopDetentionMinutes(
    load.pickupArrivedAt,
    load.pickupDepartedAt,
    load.freeTimeMinutesPickup,
    now
  );
  const deliveryWaitMinutes = stopWaitMinutes(load.deliveryArrivedAt, load.deliveryDepartedAt, now);
  const deliveryDetentionMinutes = stopDetentionMinutes(
    load.deliveryArrivedAt,
    load.deliveryDepartedAt,
    load.freeTimeMinutesDelivery,
    now
  );

  const totalDetentionMinutes = pickupDetentionMinutes + deliveryDetentionMinutes;
  const amount = round2((totalDetentionMinutes / 60) * load.ratePerHour);
  const isFinal = Boolean(load.pickupDepartedAt) && Boolean(load.deliveryDepartedAt);

  return {
    pickupWaitMinutes,
    pickupDetentionMinutes,
    deliveryWaitMinutes,
    deliveryDetentionMinutes,
    totalDetentionMinutes,
    amount,
    isFinal,
  };
}
