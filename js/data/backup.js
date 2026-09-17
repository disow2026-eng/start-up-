// Export/import of everything DockClock stores in this browser. This matters
// more here than in a normal app: since there is no server, this JSON file is
// the only backup a driver's data will ever have.

import { allDockClockKeys, readJson, writeJson } from "../lib/storage.js";

export function exportAllData() {
  const dump = {};
  for (const key of allDockClockKeys()) {
    dump[key] = readJson(key, null);
  }
  return {
    exportedAt: new Date().toISOString(),
    app: "dockclock",
    version: 1,
    data: dump,
  };
}

export function importAllData(payload) {
  if (!payload || payload.app !== "dockclock" || typeof payload.data !== "object") {
    throw new Error("That doesn't look like a DockClock backup file");
  }
  for (const [key, value] of Object.entries(payload.data)) {
    writeJson(key, value);
  }
}
