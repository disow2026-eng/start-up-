import { getCurrentUser } from "../data/session.js";

// Every protected page script calls this first. There's no server to enforce
// this — it's a UX redirect, not a security boundary (see js/lib/hash.js).
export function requireUser() {
  const user = getCurrentUser();
  if (!user) {
    // Relative, not "/login.html" — GitHub Pages project sites are served
    // from a subpath (e.g. /start-up-/), so an absolute root path 404s.
    // Every page that calls this lives under /app/, one level below login.html.
    window.location.href = "../login.html";
    return null;
  }
  return user;
}
