import { allRows, findRow, insertRow, updateRow } from "./db.js";
import { newId } from "../lib/idgen.js";
import { hashPassword } from "../lib/hash.js";
import { nowIso } from "../lib/time.js";
import { DEFAULT_FREE_TIME_MINUTES, DEFAULT_RATE_PER_HOUR } from "./constants.js";

const COLLECTION = "users";

export function findUserByEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  return findRow(COLLECTION, (u) => u.email === normalized);
}

export function getUserById(id) {
  return findRow(COLLECTION, (u) => u.id === id);
}

export async function createUser({ companyName, email, password }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  if (findUserByEmail(normalizedEmail)) {
    throw new Error("An account with that email already exists");
  }

  const passwordHash = await hashPassword(password);

  const user = {
    id: newId("user"),
    email: normalizedEmail,
    passwordHash,
    companyName: companyName.trim(),
    mcNumber: null,
    defaultFreeTimeMinutes: DEFAULT_FREE_TIME_MINUTES,
    defaultRatePerHour: DEFAULT_RATE_PER_HOUR,
    createdAt: nowIso(),
  };

  return insertRow(COLLECTION, user);
}

export function updateUserSettings(userId, patch) {
  return updateRow(COLLECTION, userId, patch);
}

export function listUsers() {
  return allRows(COLLECTION);
}
