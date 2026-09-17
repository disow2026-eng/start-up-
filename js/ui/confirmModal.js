import { el } from "../lib/dom.js";

export function confirmModal({ title, body, confirmLabel = "Confirm", danger = false }) {
  return new Promise((resolve) => {
    const overlay = el("div", { class: "modal-overlay" });

    function close(result) {
      overlay.remove();
      resolve(result);
    }

    const box = el("div", { class: "modal-box" }, [
      el("h3", { style: "font-size:18px;" }, title),
      el("p", { style: "margin-top:8px;font-size:14px;color:var(--ink-500);line-height:1.5;" }, body),
      el("div", { style: "margin-top:20px;display:flex;justify-content:flex-end;gap:12px;" }, [
        el("button", { class: "btn btn-ghost", onclick: () => close(false) }, "Cancel"),
        el(
          "button",
          {
            class: danger ? "btn btn-accent" : "btn btn-primary",
            onclick: () => close(true),
          },
          confirmLabel
        ),
      ]),
    ]);

    overlay.append(box);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close(false);
    });
    document.body.append(overlay);
  });
}
