// Generic "table" abstraction over localStorage — a stand-in for the rows a
// real database would give you. Each collection is a flat JSON array keyed
// by name ("users", "loads", "claims").

import { readJson, writeJson } from "../lib/storage.js";

export function allRows(collection) {
  return readJson(collection, []);
}

export function saveRows(collection, rows) {
  writeJson(collection, rows);
}

export function findRow(collection, predicate) {
  return allRows(collection).find(predicate) ?? null;
}

export function filterRows(collection, predicate) {
  return allRows(collection).filter(predicate);
}

export function insertRow(collection, row) {
  const rows = allRows(collection);
  rows.push(row);
  saveRows(collection, rows);
  return row;
}

export function updateRow(collection, id, patch) {
  const rows = allRows(collection);
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) return null;
  rows[index] = { ...rows[index], ...patch };
  saveRows(collection, rows);
  return rows[index];
}

export function upsertRow(collection, predicate, buildRow, patch) {
  const rows = allRows(collection);
  const index = rows.findIndex(predicate);
  if (index === -1) {
    const row = buildRow();
    rows.push(row);
    saveRows(collection, rows);
    return row;
  }
  rows[index] = { ...rows[index], ...patch };
  saveRows(collection, rows);
  return rows[index];
}
