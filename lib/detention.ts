/**
 * Detention math is the core of the product: a shipper/receiver grants a
 * fixed amount of "free time" to load or unload a truck. Every minute a
 * driver waits beyond that is billable "detention" time, at the rate set
 * in the load's rate confirmation. This is the calculation brokers and
 * shippers are contractually on the hook for, and the one drivers rarely
 * have clean enough records to actually invoice for.
 */

export function stopWaitMinutes(arrivedAt: Date | null, departedAt: Date | null, now: Date = new Date()): number {
  if (!arrivedAt) return 0;
  const end = departedAt ?? now;
  const minutes = Math.round((end.getTime() - arrivedAt.getTime()) / 60000);
  return Math.max(0, minutes);
}

export function stopDetentionMinutes(
  arrivedAt: Date | null,
  departedAt: Date | null,
  freeTimeMinutes: number,
  now: Date = new Date()
): number {
  const wait = stopWaitMinutes(arrivedAt, departedAt, now);
  return Math.max(0, wait - freeTimeMinutes);
}

export interface LoadTimeline {
  pickupArrivedAt: Date | null;
  pickupDepartedAt: Date | null;
  freeTimeMinutesPickup: number;
  deliveryArrivedAt: Date | null;
  deliveryDepartedAt: Date | null;
  freeTimeMinutesDelivery: number;
  ratePerHour: number;
}

export interface DetentionBreakdown {
  pickupWaitMinutes: number;
  pickupDetentionMinutes: number;
  deliveryWaitMinutes: number;
  deliveryDetentionMinutes: number;
  totalDetentionMinutes: number;
  amount: number;
  isFinal: boolean;
}

export function computeDetention(load: LoadTimeline, now: Date = new Date()): DetentionBreakdown {
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

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}
