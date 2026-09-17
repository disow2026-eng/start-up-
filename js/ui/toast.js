import { el, qs } from "../lib/dom.js";

function getStack() {
  let stack = qs(".toast-stack");
  if (!stack) {
    stack = el("div", { class: "toast-stack" });
    document.body.append(stack);
  }
  return stack;
}

export function showToast(message, { type = "info", duration = 3500 } = {}) {
  const stack = getStack();
  const toneClass = type === "error" ? "toast-error" : type === "success" ? "toast-success" : "";
  const node = el("div", { class: `toast ${toneClass}` }, message);
  stack.append(node);
  setTimeout(() => node.remove(), duration);
}
