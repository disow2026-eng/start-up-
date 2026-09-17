import { el } from "../lib/dom.js";
import { logo } from "./logo.js";
import { logout } from "../data/session.js";

const NAV_ITEMS = [
  { key: "dashboard", href: "dashboard.html", label: "Overview", icon: iconGrid() },
  { key: "loads", href: "loads.html", label: "Loads", icon: iconTruck() },
  { key: "claims", href: "claims.html", label: "Detention claims", icon: iconReceipt() },
  { key: "settings", href: "settings.html", label: "Settings", icon: iconGear() },
];

export function renderSidebar(root, { activeKey, companyName }) {
  const nav = el(
    "nav",
    { class: "sidebar-nav" },
    NAV_ITEMS.map((item) =>
      el(
        "a",
        {
          href: item.href,
          class: `sidebar-link${item.key === activeKey ? " active" : ""}`,
        },
        [el("span", { html: item.icon }), item.label]
      )
    )
  );

  const sidebar = el("aside", { class: "sidebar" }, [
    el("div", { class: "sidebar-head" }, logo()),
    nav,
    el("div", { class: "sidebar-foot" }, [
      el("p", { class: "company" }, companyName),
      el(
        "button",
        {
          class: "btn btn-ghost btn-block",
          style: "justify-content:flex-start;margin-top:4px;",
          onclick: () => {
            logout();
            window.location.href = "../index.html";
          },
        },
        "Sign out"
      ),
    ]),
  ]);

  root.append(sidebar);
}

function iconGrid() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`;
}
function iconTruck() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 3h13v13H1z" stroke-linejoin="round"/><path d="M14 8h4l3 3v5h-7V8z" stroke-linejoin="round"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>`;
}
function iconReceipt() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z" stroke-linejoin="round"/><path d="M9 8h6M9 12h6" stroke-linecap="round"/></svg>`;
}
function iconGear() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
}
