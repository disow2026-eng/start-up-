// Short, sortable-ish unique id — not cryptographically meaningful, just
// unique enough for a client-only "database".

let counter = 0;

export function newId(prefix = "id") {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${rand}`;
}
