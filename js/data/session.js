import { readJson, writeJson, removeKey } from "../lib/storage.js";
import { verifyPassword } from "../lib/hash.js";
import { findUserByEmail, getUserById } from "./users.js";
import { emit } from "../lib/events.js";

const SESSION_KEY = "session";

export async function login(email, password) {
  const user = findUserByEmail(email);
  if (!user) throw new Error("Invalid email or password");

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error("Invalid email or password");

  writeJson(SESSION_KEY, { userId: user.id });
  emit("session:changed", { userId: user.id });
  return user;
}

export function logout() {
  removeKey(SESSION_KEY);
  emit("session:changed", { userId: null });
}

export function getCurrentUserId() {
  return readJson(SESSION_KEY, null)?.userId ?? null;
}

export function getCurrentUser() {
  const userId = getCurrentUserId();
  return userId ? getUserById(userId) : null;
}

export function isLoggedIn() {
  return Boolean(getCurrentUserId());
}

export function startSessionForUser(userId) {
  writeJson(SESSION_KEY, { userId });
  emit("session:changed", { userId });
}
