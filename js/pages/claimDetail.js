import { onReady } from "../lib/domReady.js";
import { qs, el, mount } from "../lib/dom.js";
import { requireUser } from "../ui/authGuard.js";
import { renderSidebar } from "../ui/sidebar.js";
import { renderMobileTabBar } from "../ui/mobileTabBar.js";
import { badge } from "../ui/badge.js";
import { invoiceTable } from "../ui/invoiceTable.js";
import { printPage } from "../lib/print.js";
import { getParam } from "../lib/qs.js";
import { getClaim, setClaimStatus } from "../data/claims.js";
import { getLoad } from "../data/loads.js";
import { buildInvoiceViewModel } from "../core/invoice.js";
import { CLAIM_STATUS_LABEL, CLAIM_STATUS_TONE } from "../ui/statusBadgeMaps.js";
import { showToast } from "../ui/toast.js";

const TRANSITIONS = {
  DRAFT: [{ label: "Mark as sent to broker", next: "SENT", tone: "btn-accent" }],
  SENT: [
    { label: "Mark as paid", next: "PAID", tone: "btn-accent" },
    { label: "Mark as disputed", next: "DISPUTED", tone: "btn-outline" },
  ],
  ACKNOWLEDGED: [
    { label: "Mark as paid", next: "PAID", tone: "btn-accent" },
    { label: "Mark as disputed", next: "DISPUTED", tone: "btn-outline" },
  ],
  DISPUTED: [
    { label: "Mark as paid", next: "PAID", tone: "btn-accent" },
    { label: "Mark as rejected", next: "REJECTED", tone: "btn-outline" },
  ],
  PAID: [],
  REJECTED: [{ label: "Reopen as sent", next: "SENT", tone: "btn-outline" }],
};

onReady(() => {
  const user = requireUser();
  if (!user) return;

  renderSidebar(qs("#sidebar-root"), { activeKey: "claims", companyName: user.companyName });
  renderMobileTabBar(qs("#tabbar-root"), { activeKey: "claims" });

  const claimId = getParam("id");
  const claim = claimId && getClaim(claimId);

  if (!claim || claim.userId !== user.id) {
    mount(
      qs("#main-content"),
      el("div", { class: "empty-state" }, [
        el("p", { style: "font-weight:800;" }, "Claim not found"),
        el("a", { href: "claims.html", class: "btn btn-outline", style: "margin-top:16px;display:inline-flex;" }, "Back to claims"),
      ])
    );
    return;
  }

  render();

  function render() {
    const currentClaim = getClaim(claimId);
    const load = getLoad(currentClaim.loadId);
    const vm = buildInvoiceViewModel({ load, claim: currentClaim, user });

    const actions = (TRANSITIONS[currentClaim.status] ?? []).map((opt) =>
      el(
        "button",
        {
          class: `btn ${opt.tone}`,
          onclick: () => {
            setClaimStatus(currentClaim.id, opt.next);
            showToast(`Marked ${opt.next.toLowerCase()}`, { type: "success" });
            render();
          },
        },
        opt.label
      )
    );

    const invoiceCard = el("div", { class: "card invoice-card" }, [
      el("div", { class: "invoice-top" }, [
        el("div", {}, [
          el("p", { style: "font-family:var(--font-display);font-size:18px;font-weight:800;" }, vm.companyName),
          vm.mcNumber ? el("p", { style: "font-size:14px;color:var(--ink-500);" }, `MC# ${vm.mcNumber}`) : null,
        ]),
        el("div", { class: "right" }, [
          el("p", { style: "font-family:var(--font-display);font-size:24px;font-weight:800;" }, "Detention Invoice"),
          el("p", { style: "font-size:14px;color:var(--ink-500);" }, vm.invoiceNumber),
          el("p", { style: "font-size:14px;color:var(--ink-500);" }, vm.createdAt),
        ]),
      ]),
      el("div", { class: "invoice-meta-grid" }, [
        el("div", {}, [
          el("p", { class: "section-label" }, "Bill to"),
          el("p", { style: "margin-top:4px;font-weight:700;" }, vm.brokerName),
          vm.brokerEmail ? el("p", { style: "font-size:14px;color:var(--ink-500);" }, vm.brokerEmail) : null,
        ]),
        el("div", {}, [
          el("p", { class: "section-label" }, "Load reference"),
          el("p", { style: "margin-top:4px;font-weight:700;" }, `#${vm.loadReference}`),
          el("p", { style: "font-size:14px;color:var(--ink-500);" }, vm.route),
        ]),
      ]),
      el("div", { style: "margin-top:32px;" }, [
        el("p", { class: "section-label", style: "margin-bottom:12px;" }, "Wait time detail"),
        invoiceTable(vm.rows),
      ]),
      el("div", { class: "invoice-totals" }, [
        el("div", { class: "invoice-totals-box" }, [
          el("div", { class: "invoice-totals-row" }, [el("span", {}, "Total billable time"), el("span", { style: "font-weight:600;color:var(--ink-950);" }, vm.totalBillable)]),
          el("div", { class: "invoice-totals-row" }, [el("span", {}, "Rate"), el("span", { style: "font-weight:600;color:var(--ink-950);" }, vm.rateLabel)]),
          el("div", { class: "invoice-totals-row total" }, [el("span", {}, "Total due"), el("span", { class: "amount" }, vm.totalDue)]),
        ]),
      ]),
      el(
        "p",
        { class: "invoice-footnote" },
        "Timestamps captured directly in DockClock at the time of arrival and departure. Detention calculated per the free time and rate terms on file for this load."
      ),
    ]);

    mount(
      qs("#main-content"),
      el("div", { class: "fade-in invoice-sheet" }, [
        el("div", { style: "display:flex;align-items:center;justify-content:space-between;", class: "no-print" }, [
          el("a", { href: "claims.html", style: "font-size:14px;font-weight:700;color:var(--ink-500);" }, "← All claims"),
          badge(CLAIM_STATUS_LABEL[currentClaim.status], CLAIM_STATUS_TONE[currentClaim.status]),
        ]),
        el("div", { style: "margin-top:16px;" }, invoiceCard),
        el("div", { class: "no-print", style: "margin-top:24px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;" }, [
          ...actions,
          el("button", { class: "btn btn-ghost", onclick: printPage }, "Print / Save PDF"),
        ]),
      ])
    );
  }
});
