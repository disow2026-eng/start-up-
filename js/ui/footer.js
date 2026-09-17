import { el } from "../lib/dom.js";

export function renderFooter(root) {
  const footer = el("footer", { class: "mkt-footer" }, [
    el("div", { class: "container mkt-footer-inner" }, [
      el("p", {}, `© ${new Date().getFullYear()} DockClock. Built for the people who actually drive.`),
      el("div", { class: "mkt-footer-links" }, [
        el("a", { href: "login.html" }, "Log in"),
        el("a", { href: "signup.html" }, "Sign up"),
      ]),
    ]),
  ]);
  root.append(footer);
}
