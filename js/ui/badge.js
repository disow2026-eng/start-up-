import { el } from "../lib/dom.js";

export function badge(text, tone = "slate") {
  return el("span", { class: `badge badge-${tone}` }, text);
}
