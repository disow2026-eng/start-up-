import { el } from "../lib/dom.js";

const NAV_ITEMS = [
  { key: "dashboard", href: "dashboard.html", label: "Overview" },
  { key: "loads", href: "loads.html", label: "Loads" },
  { key: "claims", href: "claims.html", label: "Claims" },
  { key: "settings", href: "settings.html", label: "Settings" },
];

export function renderMobileTabBar(root, { activeKey }) {
  const bar = el(
    "nav",
    { class: "mobile-tabbar no-print" },
    NAV_ITEMS.map((item) =>
      el("a", { href: item.href, class: item.key === activeKey ? "active" : "" }, item.label)
    )
  );
  root.append(bar);
}
