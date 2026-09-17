// Password "hashing" for a client-only demo. This is NOT real security:
// there is no server to enforce it, and anyone with devtools can read or
// rewrite localStorage directly, bypassing login entirely. It exists only so
// a password isn't sitting in plain text in the browser's storage inspector.
// Do not reuse this pattern for an app that holds real user data.

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPassword(password) {
  const salt = randomSalt();
  const hash = await sha256Hex(salt + password);
  return `${salt}:${hash}`;
}

export async function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const check = await sha256Hex(salt + password);
  return check === hash;
}
