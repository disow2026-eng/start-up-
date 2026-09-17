import { onReady } from "../lib/domReady.js";
import { qs, el, mount } from "../lib/dom.js";
import { requireUser } from "../ui/authGuard.js";
import { renderSidebar } from "../ui/sidebar.js";
import { renderMobileTabBar } from "../ui/mobileTabBar.js";
import { statCard } from "../ui/statCard.js";
import { badge } from "../ui/badge.js";
import { emptyState } from "../ui/emptyState.js";
import { dataTable } from "../ui/table.js";
import { listLoadsForUser } from "../data/loads.js";
import { listClaimsForUser } from "../data/claims.js";
import { computeDetention } from "../core/detention.js";
import { formatCurrency } from "../lib/currency.js";
import { formatMinutes } from "../lib/time.js";
import { LOAD_STATUS_LABEL, LOAD_STATUS_TONE } from "../ui/statusBadgeMaps.js";
import { seedDemoLoad } from "../data/seed.js";
import { showToast } from "../ui/toast.js";

onReady(() => {
  const user = requireUser();
  if (!user) return;

  renderSidebar(qs("#sidebar-root"), { activeKey: "dashboard", companyName: user.companyName });
  renderMobileTabBar(qs("#tabbar-root"), { activeKey: "dashboard" });

  render();

  function render() {
    const loads = listLoadsForUser(user.id);
    const claims = listClaimsForUser(user.id);
    const now = new Date();
    const liveTotals = loads.map((l) => computeDetention(l, now));

    const totalDetentionMinutesEver = liveTotals.reduce((sum, d) => sum + d.totalDetentionMinutes, 0);
    const totalDetentionValueEver = liveTotals.reduce((sum, d) => sum + d.amount, 0);
    const recovered = claims.filter((c) => c.status === "PAID").reduce((sum, c) => sum + c.amount, 0);
    const pending = claims.filter((c) => c.status === "SENT" || c.status === "ACKNOWLEDGED");
    const pendingAmount = pending.reduce((sum, c) => sum + c.amount, 0);
    const activeLoads = loads.filter((l) => l.status !== "COMPLETED");
    const currentlyWaiting = loads.filter((l) => {
      const atPickup = l.pickupArrivedAt && !l.pickupDepartedAt;
      const atDelivery = l.deliveryArrivedAt && !l.deliveryDepartedAt;
      return atPickup || atDelivery;
    });

    const statGrid = el("div", { class: "stat-grid" }, [
      statCard({
        label: "Detention tracked (all-time)",
        value: formatCurrency(totalDetentionValueEver),
        sub: `${formatMinutes(totalDetentionMinutesEver)} of wait time`,
      }),
      statCard({
        label: "Recovered",
        value: formatCurrency(recovered),
        sub: `${claims.filter((c) => c.status === "PAID").length} claims paid`,
        tone: "green",
      }),
      statCard({
        label: "Pending on brokers",
        value: formatCurrency(pendingAmount),
        sub: `${pending.length} invoices outstanding`,
        tone: "amber",
      }),
      statCard({
        label: "Active loads",
        value: String(activeLoads.length),
        sub: `${currentlyWaiting.length} currently on the clock`,
      }),
    ]);

    const waitingSection =
      currentlyWaiting.length > 0
        ? el("div", { style: "margin-top:32px;" }, [
            el("h2", { class: "section-label" }, "On the clock right now"),
            el(
              "div",
              { style: "margin-top:12px;display:flex;flex-direction:column;gap:12px;" },
              currentlyWaiting.map((load) => {
                const d = computeDetention(load, now);
                const atPickup = load.pickupArrivedAt && !load.pickupDepartedAt;
                return el(
                  "a",
                  { href: `load.html?id=${load.id}`, class: "list-row" },
                  [
                    el("div", {}, [
                      el("p", { style: "font-weight:700;" }, `#${load.referenceNumber} · ${load.brokerName}`),
                      el(
                        "p",
                        { style: "font-size:14px;color:var(--ink-500);" },
                        `Waiting at ${atPickup ? load.shipperName : load.receiverName}`
                      ),
                    ]),
                    el("div", { style: "text-align:right;" }, [
                      el(
                        "p",
                        { style: "font-family:var(--font-display);font-size:18px;font-weight:800;color:var(--amber-600);" },
                        formatMinutes(atPickup ? d.pickupWaitMinutes : d.deliveryWaitMinutes)
                      ),
                      el("p", { style: "font-size:12px;color:var(--ink-400);" }, "elapsed"),
                    ]),
                  ]
                );
              })
            ),
          ])
        : null;

    let recentSection;
    if (loads.length === 0) {
      recentSection = el("div", { style: "margin-top:32px;" }, [
        el("h2", { class: "section-label" }, "Recent loads"),
        el("div", { style: "margin-top:12px;" }, [
          emptyState({
            title: "No loads yet",
            body: "Add your next load and start the clock the moment you check in at the shipper.",
            actionLabel: "+ New load",
            actionHref: "load-new.html",
          }),
          el(
            "div",
            { style: "text-align:center;margin-top:16px;" },
            el(
              "button",
              {
                class: "btn btn-outline",
                onclick: () => {
                  seedDemoLoad(user.id);
                  showToast("Demo load added", { type: "success" });
                  render();
                },
              },
              "Or load demo data"
            )
          ),
        ]),
      ]);
    } else {
      const table = dataTable(
        [
          {
            header: "Load",
            cell: (load) => el("a", { href: `load.html?id=${load.id}`, style: "font-weight:700;" }, `#${load.referenceNumber}`),
          },
          { header: "Broker", cell: (load) => load.brokerName, hideOnMobile: true },
          {
            header: "Status",
            cell: (load) => badge(LOAD_STATUS_LABEL[load.status], LOAD_STATUS_TONE[load.status]),
          },
          {
            header: "Detention",
            cell: (load) => {
              const d = computeDetention(load, now);
              return el("span", { style: "font-weight:700;" }, formatCurrency(d.amount));
            },
          },
        ],
        loads.slice(0, 6)
      );

      recentSection = el("div", { style: "margin-top:32px;" }, [
        el("div", { style: "display:flex;align-items:center;justify-content:space-between;" }, [
          el("h2", { class: "section-label" }, "Recent loads"),
          el("a", { href: "loads.html", style: "font-size:14px;font-weight:700;" }, "View all →"),
        ]),
        el("div", { class: "card", style: "margin-top:12px;overflow:hidden;" }, table),
      ]);
    }

    mount(
      qs("#main-content"),
      el("div", { class: "fade-in" }, [
        el("div", { class: "page-head" }, [
          el("div", {}, [
            el("h1", {}, "Overview"),
            el("p", { class: "subtitle" }, "Every minute of wait time you've logged, in one place."),
          ]),
          el("a", { href: "load-new.html", class: "btn btn-accent" }, "+ New load"),
        ]),
        statGrid,
        waitingSection,
        recentSection,
      ])
    );
  }
});
