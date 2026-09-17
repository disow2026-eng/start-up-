// Minimal pub-sub so unrelated modules (e.g. the sidebar user-name label and
// the settings form) can react to state changes without importing each other.

const listeners = new Map();

export function on(eventName, handler) {
  if (!listeners.has(eventName)) listeners.set(eventName, new Set());
  listeners.get(eventName).add(handler);
  return () => off(eventName, handler);
}

export function off(eventName, handler) {
  listeners.get(eventName)?.delete(handler);
}

export function emit(eventName, payload) {
  listeners.get(eventName)?.forEach((handler) => handler(payload));
}
