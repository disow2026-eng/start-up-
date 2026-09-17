import { findRow, filterRows, upsertRow, updateRow } from "./db.js";
import { newId } from "../lib/idgen.js";
import { nowIso } from "../lib/time.js";
import { computeDetention } from "../core/detention.js";
import { CLAIM_STATUS } from "./constants.js";

const COLLECTION = "claims";

export function getClaim(id) {
  return findRow(COLLECTION, (c) => c.id === id);
}

export function getClaimByLoadId(loadId) {
  return findRow(COLLECTION, (c) => c.loadId === loadId);
}

export function listClaimsForUser(userId) {
  return filterRows(COLLECTION, (c) => c.userId === userId).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

// Called once a load's delivery departure is logged. Safe to call again
// (e.g. if timestamps are ever corrected) — it recalculates in place.
export function generateOrUpdateClaimForLoad(load) {
  const detention = computeDetention(load);

  return upsertRow(
    COLLECTION,
    (c) => c.loadId === load.id,
    () => ({
      id: newId("claim"),
      loadId: load.id,
      userId: load.userId,
      pickupDetentionMinutes: detention.pickupDetentionMinutes,
      deliveryDetentionMinutes: detention.deliveryDetentionMinutes,
      totalDetentionMinutes: detention.totalDetentionMinutes,
      ratePerHour: load.ratePerHour,
      amount: detention.amount,
      status: CLAIM_STATUS.DRAFT,
      notes: null,
      sentAt: null,
      paidAt: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }),
    {
      pickupDetentionMinutes: detention.pickupDetentionMinutes,
      deliveryDetentionMinutes: detention.deliveryDetentionMinutes,
      totalDetentionMinutes: detention.totalDetentionMinutes,
      ratePerHour: load.ratePerHour,
      amount: detention.amount,
      updatedAt: nowIso(),
    }
  );
}

export function setClaimStatus(claimId, status) {
  const claim = getClaim(claimId);
  if (!claim) throw new Error("Claim not found");

  const now = nowIso();
  return updateRow(COLLECTION, claimId, {
    status,
    updatedAt: now,
    sentAt: status === CLAIM_STATUS.SENT && !claim.sentAt ? now : claim.sentAt,
    paidAt: status === CLAIM_STATUS.PAID ? now : claim.paidAt,
  });
}
