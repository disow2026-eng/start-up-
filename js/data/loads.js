import { allRows, findRow, filterRows, insertRow, updateRow } from "./db.js";
import { newId } from "../lib/idgen.js";
import { nowIso } from "../lib/time.js";
import { LOAD_STATUS } from "./constants.js";

const COLLECTION = "loads";

export function listLoadsForUser(userId) {
  return filterRows(COLLECTION, (l) => l.userId === userId).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function getLoad(id) {
  return findRow(COLLECTION, (l) => l.id === id);
}

export function createLoad(userId, fields) {
  const load = {
    id: newId("load"),
    userId,
    referenceNumber: fields.referenceNumber.trim(),
    brokerName: fields.brokerName.trim(),
    brokerEmail: fields.brokerEmail?.trim() || null,

    shipperName: fields.shipperName.trim(),
    shipperCity: fields.shipperCity?.trim() || null,
    shipperState: fields.shipperState?.trim() || null,

    receiverName: fields.receiverName.trim(),
    receiverCity: fields.receiverCity?.trim() || null,
    receiverState: fields.receiverState?.trim() || null,

    rateConText: fields.rateConText || null,

    freeTimeMinutesPickup: fields.freeTimeMinutesPickup,
    freeTimeMinutesDelivery: fields.freeTimeMinutesDelivery,
    ratePerHour: fields.ratePerHour,

    pickupAppointmentAt: fields.pickupAppointmentAt || null,
    pickupArrivedAt: null,
    pickupDepartedAt: null,

    deliveryAppointmentAt: fields.deliveryAppointmentAt || null,
    deliveryArrivedAt: null,
    deliveryDepartedAt: null,

    status: LOAD_STATUS.PLANNED,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  return insertRow(COLLECTION, load);
}

const STOP_FIELD = {
  pickup: { arrive: "pickupArrivedAt", depart: "pickupDepartedAt", arriveCheck: "pickupArrivedAt" },
  delivery: { arrive: "deliveryArrivedAt", depart: "deliveryDepartedAt", arriveCheck: "deliveryArrivedAt" },
};

const NEXT_STATUS = {
  "pickup:arrive": LOAD_STATUS.AT_PICKUP,
  "pickup:depart": LOAD_STATUS.IN_TRANSIT,
  "delivery:arrive": LOAD_STATUS.AT_DELIVERY,
  "delivery:depart": LOAD_STATUS.COMPLETED,
};

export function logStopEvent(loadId, stop, event) {
  const load = getLoad(loadId);
  if (!load) throw new Error("Load not found");

  const fieldMap = STOP_FIELD[stop];
  if (!fieldMap) throw new Error("Invalid stop");

  if (event === "depart" && !load[fieldMap.arriveCheck]) {
    throw new Error(`Log the ${stop} arrival before departure`);
  }

  const field = event === "arrive" ? fieldMap.arrive : fieldMap.depart;
  const status = NEXT_STATUS[`${stop}:${event}`] ?? load.status;

  return updateRow(COLLECTION, loadId, {
    [field]: nowIso(),
    status,
    updatedAt: nowIso(),
  });
}

export function allLoads() {
  return allRows(COLLECTION);
}
