import { onReady } from "../lib/domReady.js";
import { qs, el, mount } from "../lib/dom.js";
import { requireUser } from "../ui/authGuard.js";
import { renderSidebar } from "../ui/sidebar.js";
import { renderMobileTabBar } from "../ui/mobileTabBar.js";
import { emptyState } from "../ui/emptyState.js";
import { badge } from "../ui/badge.js";
import { listLoadsForUser } from "../data/loads.js";
import { computeDetention } from "../core/detention.js";
import { formatCurrency } from "../lib/currency.js";
import { formatMinutes } from "../lib/time.js";
import { LOAD_STATUS_LABEL, LOAD_STATUS_TONE } from "../ui/statusBadgeMaps.js";

onReady(() => {
  const user = requireUser();
  if (!user) return;

  renderSidebar(qs("#sidebar-root"), { activeKey: "loads", companyName: user.companyName });
  renderMobileTabBar(qs("#tabbar-root"), { activeKey: "loads" });

  const loads = listLoadsForUser(user.id);
  const now = new Date();

  const body =
    loads.length === 0
      ? el(
          "div",
          { style: "margin-top:32px;" },
          emptyState({
            title: "No loads yet",
            body: "Add a load to start logging arrival and departure times.",
            actionLabel: "+ New load",
            actionHref: "load-new.html",
          })
        )
      : el(
          "div",
          { style: "margin-top:24px;display:flex;flex-direction:column;gap:12px;" },
          loads.map((load) => {
            const d = computeDetention(load, now);
            return el("a", { href: `load.html?id=${load.id}`, class: "list-row" }, [
              el("div", {}, [
                el("div", { style: "display:flex;align-items:center;gap:8px;" }, [
                  el("p", { style: "font-family:var(--font-display);font-weight:800;" }, `#${load.referenceNumber}`),
                  badge(LOAD_STATUS_LABEL[load.status], LOAD_STATUS_TONE[load.status]),
                ]),
                el(
                  "p",
                  { style: "margin-top:4px;font-size:14px;color:var(--ink-500);" },
                  `${load.brokerName} · ${load.shipperName} → ${load.receiverName}`
                ),
              ]),
              el("div", { style: "display:flex;gap:24px;" }, [
                el("div", {}, [
                  el("p", { style: "font-size:12px;color:var(--ink-400);" }, "Detention so far"),
                  el("p", { style: "font-family:var(--font-display);font-weight:800;" }, formatMinutes(d.totalDetentionMinutes)),
                ]),
                el("div", {}, [
                  el("p", { style: "font-size:12px;color:var(--ink-400);" }, "Value"),
                  el(
                    "p",
                    { style: "font-family:var(--font-display);font-weight:800;color:var(--amber-600);" },
                    formatCurrency(d.amount)
                  ),
                ]),
              ]),
            ]);
          })
        );

  mount(
    qs("#main-content"),
    el("div", { class: "fade-in" }, [
      el("div", { class: "page-head" }, [
        el("div", {}, [
          el("h1", {}, "Loads"),
          el("p", { class: "subtitle" }, "Every load you're clocking wait time on."),
        ]),
        el("a", { href: "load-new.html", class: "btn btn-accent" }, "+ New load"),
      ]),
      body,
    ])
  );
});
