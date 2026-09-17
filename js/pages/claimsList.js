import { onReady } from "../lib/domReady.js";
import { qs, el, mount } from "../lib/dom.js";
import { requireUser } from "../ui/authGuard.js";
import { renderSidebar } from "../ui/sidebar.js";
import { renderMobileTabBar } from "../ui/mobileTabBar.js";
import { emptyState } from "../ui/emptyState.js";
import { badge } from "../ui/badge.js";
import { dataTable } from "../ui/table.js";
import { statCard } from "../ui/statCard.js";
import { listClaimsForUser } from "../data/claims.js";
import { getLoad } from "../data/loads.js";
import { formatCurrency } from "../lib/currency.js";
import { formatMinutes } from "../lib/time.js";
import { CLAIM_STATUS_LABEL, CLAIM_STATUS_TONE } from "../ui/statusBadgeMaps.js";

onReady(() => {
  const user = requireUser();
  if (!user) return;

  renderSidebar(qs("#sidebar-root"), { activeKey: "claims", companyName: user.companyName });
  renderMobileTabBar(qs("#tabbar-root"), { activeKey: "claims" });

  const claims = listClaimsForUser(user.id).map((claim) => ({ ...claim, load: getLoad(claim.loadId) }));

  const totalOutstanding = claims
    .filter((c) => c.status === "SENT" || c.status === "ACKNOWLEDGED")
    .reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = claims.filter((c) => c.status === "PAID").reduce((sum, c) => sum + c.amount, 0);

  const stats = el("div", { style: "display:grid;grid-template-columns:repeat(2,1fr);gap:16px;max-width:420px;margin-top:24px;" }, [
    statCard({ label: "Outstanding", value: formatCurrency(totalOutstanding), sub: "", tone: "amber" }),
    statCard({ label: "Recovered", value: formatCurrency(totalPaid), sub: "", tone: "green" }),
  ]);

  let body;
  if (claims.length === 0) {
    body = el(
      "div",
      { style: "margin-top:32px;" },
      emptyState({
        title: "No claims yet",
        body: "Claims are created automatically once a load's delivery departure is logged.",
      })
    );
  } else {
    const table = dataTable(
      [
        {
          header: "Load",
          cell: (c) => el("a", { href: `claim.html?id=${c.id}`, style: "font-weight:700;" }, `#${c.load.referenceNumber}`),
        },
        { header: "Broker", cell: (c) => c.load.brokerName, hideOnMobile: true },
        { header: "Detention", cell: (c) => formatMinutes(c.totalDetentionMinutes), hideOnMobile: true },
        { header: "Status", cell: (c) => badge(CLAIM_STATUS_LABEL[c.status], CLAIM_STATUS_TONE[c.status]) },
        { header: "Amount", cell: (c) => el("span", { style: "font-weight:700;" }, formatCurrency(c.amount)) },
      ],
      claims
    );
    body = el("div", { class: "card", style: "margin-top:24px;overflow:hidden;" }, table);
  }

  mount(
    qs("#main-content"),
    el("div", { class: "fade-in" }, [
      el("h1", {}, "Detention claims"),
      el("p", { class: "subtitle" }, "Invoices generated from completed loads."),
      stats,
      body,
    ])
  );
});
