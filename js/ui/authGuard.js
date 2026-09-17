import { getCurrentUser } from "../data/session.js";

// Every protected page script calls this first. There's no server to enforce
// this — it's a UX redirect, not a security boundary (see js/lib/hash.js).
export function requireUser() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "/login.html";
    return null;
  }
  return user;
}
