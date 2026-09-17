import { el } from "../lib/dom.js";

export function logo({ dark = false } = {}) {
  return el(
    "span",
    { class: "logo", style: "display:inline-flex;align-items:center;gap:8px;font-family:var(--font-display);font-weight:800;" },
    [
      el("span", {
        style:
          "display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:var(--ink-950);",
        html: `<svg width="16" height="16" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="34" stroke="#E8590C" stroke-width="10"/><path d="M50 30v20l14 10" stroke="#E8590C" stroke-width="10" stroke-linecap="round"/></svg>`,
      }),
      el("span", { style: `color:${dark ? "white" : "var(--ink-950)"};` }, "DockClock"),
    ]
  );
}
