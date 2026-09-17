import { el } from "../lib/dom.js";
import { logo } from "./logo.js";

export function renderMarketingNav(root) {
  const nav = el("header", { class: "mkt-nav" }, [
    el("div", { class: "container mkt-nav-inner" }, [
      logo({ dark: true }),
      el("nav", { class: "mkt-nav-links" }, [
        el("a", { href: "#how-it-works" }, "How it works"),
        el("a", { href: "#features" }, "Features"),
        el("a", { href: "#pricing" }, "Pricing"),
      ]),
      el("div", { style: "display:flex;align-items:center;gap:12px;" }, [
        el("a", { href: "login.html", style: "font-size:14px;font-weight:600;color:var(--ink-200);" }, "Log in"),
        el("a", { href: "signup.html", class: "btn btn-accent", style: "padding:8px 16px;font-size:14px;" }, "Start free"),
      ]),
    ]),
  ]);
  root.append(nav);
}
