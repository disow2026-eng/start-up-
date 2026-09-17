import { onReady } from "../lib/domReady.js";
import { qs, el, mount } from "../lib/dom.js";
import { requireUser } from "../ui/authGuard.js";
import { renderSidebar } from "../ui/sidebar.js";
import { renderMobileTabBar } from "../ui/mobileTabBar.js";
import { badge } from "../ui/badge.js";
import { mountLiveElapsed } from "../ui/liveElapsed.js";
import { getParam } from "../lib/qs.js";
import { getLoad, logStopEvent } from "../data/loads.js";
import { getClaimByLoadId, generateOrUpdateClaimForLoad } from "../data/claims.js";
import { formatCurrency } from "../lib/currency.js";
import { formatMinutes, formatDateTime } from "../lib/time.js";
import { LOAD_STATUS_LABEL, LOAD_STATUS_TONE } from "../ui/statusBadgeMaps.js";
import { showToast } from "../ui/toast.js";

onReady(() => {
  const user = requireUser();
  if (!user) return;

  renderSidebar(qs("#sidebar-root"), { activeKey: "loads", companyName: user.companyName });
  renderMobileTabBar(qs("#tabbar-root"), { activeKey: "loads" });

  const loadId = getParam("id");
  const load = loadId && getLoad(loadId);

  if (!load || load.userId !== user.id) {
    mount(
      qs("#main-content"),
      el("div", { class: "empty-state" }, [
        el("p", { style: "font-weight:800;" }, "Load not found"),
        el("a", { href: "loads.html", class: "btn btn-outline", style: "margin-top:16px;display:inline-flex;" }, "Back to loads"),
      ])
    );
    return;
  }

  render();

  function render() {
    const current = getLoad(loadId);
    const claim = getClaimByLoadId(loadId);
    const pickupDone = Boolean(current.pickupDepartedAt);

    function logTime(stop, event) {
      try {
        logStopEvent(loadId, stop, event);
        if (stop === "delivery" && event === "depart") {
          generateOrUpdateClaimForLoad(getLoad(loadId));
        }
        render();
      } catch (err) {
        showToast(err.message, { type: "error" });
      }
    }

    const pickupLive = el("div");
    const deliveryLive = el("div");

    const pickupCard = el("div", { class: "stop-card" }, [
      el("p", { class: "section-label" }, "Pickup"),
      el("p", { style: "margin-top:4px;font-family:var(--font-display);font-weight:800;" }, current.shipperName),
      el(
        "p",
        { style: "font-size:14px;color:var(--ink-500);" },
        [current.shipperCity, current.shipperState].filter(Boolean).join(", ") || "—"
      ),
      current.pickupAppointmentAt
        ? el("p", { style: "font-size:12px;color:var(--ink-400);margin-top:4px;" }, `Appt: ${formatDateTime(current.pickupAppointmentAt)}`)
        : null,
      el(
        "p",
        { style: "font-size:12px;color:var(--ink-400);margin-top:4px;" },
        `Free time: ${(current.freeTimeMinutesPickup / 60).toFixed(2).replace(/\.?0+$/, "")}h`
      ),
      el("div", { class: "stop-footer" }, [
        pickupLive,
        pickupActionButton(),
      ]),
    ]);

    function pickupActionButton() {
      if (!current.pickupArrivedAt) {
        return el("button", { class: "btn btn-accent", onclick: () => logTime("pickup", "arrive") }, "Log arrival");
      }
      if (!current.pickupDepartedAt) {
        return el("button", { class: "btn btn-primary", onclick: () => logTime("pickup", "depart") }, "Log departure");
      }
      return el(
        "p",
        { style: "font-size:12px;font-weight:700;color:var(--green-600);" },
        `Departed ${formatDateTime(current.pickupDepartedAt)}`
      );
    }

    const deliveryCard = el("div", { class: `stop-card${pickupDone ? "" : " locked"}` }, [
      el("p", { class: "section-label" }, "Delivery"),
      el("p", { style: "margin-top:4px;font-family:var(--font-display);font-weight:800;" }, current.receiverName),
      el(
        "p",
        { style: "font-size:14px;color:var(--ink-500);" },
        [current.receiverCity, current.receiverState].filter(Boolean).join(", ") || "—"
      ),
      current.deliveryAppointmentAt
        ? el("p", { style: "font-size:12px;color:var(--ink-400);margin-top:4px;" }, `Appt: ${formatDateTime(current.deliveryAppointmentAt)}`)
        : null,
      el(
        "p",
        { style: "font-size:12px;color:var(--ink-400);margin-top:4px;" },
        `Free time: ${(current.freeTimeMinutesDelivery / 60).toFixed(2).replace(/\.?0+$/, "")}h`
      ),
      el("div", { class: "stop-footer" }, [
        deliveryLive,
        deliveryActionButton(),
      ]),
    ]);

    function deliveryActionButton() {
      if (!pickupDone) return el("p", { style: "font-size:12px;color:var(--ink-400);" }, "Complete pickup first");
      if (!current.deliveryArrivedAt) {
        return el("button", { class: "btn btn-accent", onclick: () => logTime("delivery", "arrive") }, "Log arrival");
      }
      if (!current.deliveryDepartedAt) {
        return el("button", { class: "btn btn-primary", onclick: () => logTime("delivery", "depart") }, "Log departure");
      }
      return el(
        "p",
        { style: "font-size:12px;font-weight:700;color:var(--green-600);" },
        `Departed ${formatDateTime(current.deliveryDepartedAt)}`
      );
    }

    const claimSection = claim
      ? el("div", { class: "card card-pad", style: "margin-top:24px;display:flex;align-items:center;justify-content:space-between;" }, [
          el("div", {}, [
            el("p", { class: "section-label" }, "Detention claim"),
            el("p", { style: "margin-top:4px;font-family:var(--font-display);font-size:22px;font-weight:800;" }, formatCurrency(claim.amount)),
            el("p", { style: "font-size:14px;color:var(--ink-500);" }, `${formatMinutes(claim.totalDetentionMinutes)} billable`),
          ]),
          el("a", { href: `claim.html?id=${claim.id}`, class: "btn btn-accent" }, "Manage invoice"),
        ])
      : el(
          "p",
          { style: "margin-top:24px;text-align:center;font-size:14px;color:var(--ink-400);" },
          "A detention invoice will be generated automatically once delivery is complete."
        );

    mount(
      qs("#main-content"),
      el("div", { class: "fade-in" }, [
        el("div", { class: "page-head" }, [
          el("div", {}, [
            el("div", { style: "display:flex;align-items:center;gap:8px;" }, [
              el("h1", {}, `#${current.referenceNumber}`),
              badge(LOAD_STATUS_LABEL[current.status], LOAD_STATUS_TONE[current.status]),
            ]),
            el("p", { class: "subtitle" }, current.brokerName),
          ]),
          claim ? el("a", { href: `claim.html?id=${claim.id}`, class: "btn btn-outline" }, "View invoice →") : null,
        ]),
        el("div", { style: "margin-top:24px;display:grid;gap:16px;", class: "stop-grid" }, [pickupCard, deliveryCard]),
        claimSection,
      ])
    );

    // Live tickers need to mount after the nodes above are in the DOM.
    mountLiveElapsed(pickupLive, {
      arrivedAt: current.pickupArrivedAt,
      departedAt: current.pickupDepartedAt,
      freeTimeMinutes: current.freeTimeMinutesPickup,
    });
    mountLiveElapsed(deliveryLive, {
      arrivedAt: current.deliveryArrivedAt,
      departedAt: current.deliveryDepartedAt,
      freeTimeMinutes: current.freeTimeMinutesDelivery,
    });
  }
});
