import { el } from "../lib/dom.js";

// Builds a labeled input and returns { wrap, input } so the caller can read
// input.value later without re-querying the DOM.
export function formField({ label, id, type = "text", step, required = false, span2 = false, value = "" }) {
  const input = el("input", { class: "input", type, id, step, required, value });
  const wrap = el(span2 ? "div" : "div", { class: span2 ? "span-2" : "" }, [
    el("label", { class: "label", for: id }, label),
    input,
  ]);
  return { wrap, input };
}
