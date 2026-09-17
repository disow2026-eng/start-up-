import { el } from "../lib/dom.js";

export function emptyState({ title, body, actionLabel, actionHref }) {
  return el("div", { class: "empty-state" }, [
    el("p", { style: "font-family:var(--font-display);font-weight:800;color:var(--ink-800);" }, title),
    el(
      "p",
      { style: "margin:8px auto 0;max-width:380px;font-size:14px;color:var(--ink-500);" },
      body
    ),
    actionLabel
      ? el("a", { href: actionHref, class: "btn btn-accent", style: "margin-top:16px;display:inline-flex;" }, actionLabel)
      : null,
  ]);
}
