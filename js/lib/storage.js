// Thin JSON wrapper around localStorage. Every piece of app data ultimately
// flows through here — this is the entire "database" for a static, no-backend
// build. It lives only in this browser: no sync across devices, and clearing
// site data or using a private window loses everything.

const PREFIX = "dockclock:";

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  localStorage.removeItem(PREFIX + key);
}

export function isStorageAvailable() {
  try {
    const testKey = PREFIX + "__test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function allDockClockKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) keys.push(key.slice(PREFIX.length));
  }
  return keys;
}
