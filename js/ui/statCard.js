import { el } from "../lib/dom.js";

export function statCard({ label, value, sub, tone = "default" }) {
  const toneClass = tone === "green" ? "green" : tone === "amber" ? "amber" : "";
  return el("div", { class: "stat-card" }, [
    el("p", { class: "stat-label" }, label),
    el("p", { class: `stat-value ${toneClass}` }, value),
    el("p", { class: "stat-sub" }, sub),
  ]);
}
