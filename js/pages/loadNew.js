import { onReady } from "../lib/domReady.js";
import { qs, el, mount } from "../lib/dom.js";
import { requireUser } from "../ui/authGuard.js";
import { renderSidebar } from "../ui/sidebar.js";
import { renderMobileTabBar } from "../ui/mobileTabBar.js";
import { formField } from "../ui/formField.js";
import { createLoad } from "../data/loads.js";
import { parseRateConfirmation } from "../core/rateConParser.js";
import { fromDatetimeLocalValue } from "../lib/time.js";

onReady(() => {
  const user = requireUser();
  if (!user) return;

  renderSidebar(qs("#sidebar-root"), { activeKey: "loads", companyName: user.companyName });
  renderMobileTabBar(qs("#tabbar-root"), { activeKey: "loads" });

  const defaultFreeHours = user.defaultFreeTimeMinutes / 60;

  const fields = {
    referenceNumber: formField({ label: "Load / reference #", id: "referenceNumber", required: true }),
    brokerName: formField({ label: "Broker name", id: "brokerName", required: true }),
    brokerEmail: formField({ label: "Broker email (for invoicing)", id: "brokerEmail", type: "email", span2: true }),

    shipperName: formField({ label: "Shipper name", id: "shipperName", required: true, span2: true }),
    shipperCity: formField({ label: "City", id: "shipperCity" }),
    shipperState: formField({ label: "State", id: "shipperState" }),
    pickupAppointmentAt: formField({ label: "Appointment", id: "pickupAppointmentAt", type: "datetime-local", span2: true }),
    freeTimeHoursPickup: formField({
      label: "Free time (hours)",
      id: "freeTimeHoursPickup",
      type: "number",
      step: "0.25",
      span2: true,
      value: String(defaultFreeHours),
    }),

    receiverName: formField({ label: "Receiver name", id: "receiverName", required: true, span2: true }),
    receiverCity: formField({ label: "City", id: "receiverCity" }),
    receiverState: formField({ label: "State", id: "receiverState" }),
    deliveryAppointmentAt: formField({ label: "Appointment", id: "deliveryAppointmentAt", type: "datetime-local", span2: true }),
    freeTimeHoursDelivery: formField({
      label: "Free time (hours)",
      id: "freeTimeHoursDelivery",
      type: "number",
      step: "0.25",
      span2: true,
      value: String(defaultFreeHours),
    }),

    ratePerHour: formField({
      label: "Rate per hour ($)",
      id: "ratePerHour",
      type: "number",
      step: "0.01",
      required: true,
      value: String(user.defaultRatePerHour),
    }),
  };

  const rateConText = el("textarea", {
    class: "input",
    id: "rateConText",
    placeholder: "Paste the email or PDF text of your rate confirmation here…",
  });
  const parseError = el("p", { style: "font-size:14px;color:var(--red-600);" });
  const parseSuccess = el("p", { class: "form-success" });

  const parseCard = el("div", { class: "card card-pad" }, [
    el("div", { style: "display:flex;align-items:center;gap:8px;" }, [
      el("span", { class: "badge badge-amber" }, "Smart paste"),
      el("p", { style: "font-size:14px;font-weight:600;color:var(--ink-800);" }, "Paste your rate confirmation"),
    ]),
    el(
      "p",
      { style: "margin-top:6px;font-size:12px;color:var(--ink-400);" },
      "Pattern-matches common fields (no AI call — nothing leaves your browser). Always double-check what it fills in."
    ),
    el("div", { style: "margin-top:12px;" }, rateConText),
    el("div", { style: "margin-top:12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;" }, [
      el(
        "button",
        {
          type: "button",
          class: "btn btn-outline",
          onclick: () => {
            mount(parseError, "");
            mount(parseSuccess, "");
            const result = parseRateConfirmation(rateConText.value);
            const matched = Object.values(result).filter((v) => v !== undefined).length;
            if (matched === 0) {
              mount(parseError, "Couldn't find any recognizable fields in that text — enter the load manually below.");
              return;
            }
            applyParsedFields(result);
            mount(parseSuccess, `Filled in ${matched} field${matched === 1 ? "" : "s"} — check them over below.`);
          },
        },
        "✨ Extract details"
      ),
      parseSuccess,
      parseError,
    ]),
  ]);

  function applyParsedFields(result) {
    if (result.referenceNumber) fields.referenceNumber.input.value = result.referenceNumber;
    if (result.brokerName) fields.brokerName.input.value = result.brokerName;
    if (result.brokerEmail) fields.brokerEmail.input.value = result.brokerEmail;
    if (result.shipperName) fields.shipperName.input.value = result.shipperName;
    if (result.shipperCity) fields.shipperCity.input.value = result.shipperCity;
    if (result.shipperState) fields.shipperState.input.value = result.shipperState;
    if (result.receiverName) fields.receiverName.input.value = result.receiverName;
    if (result.receiverCity) fields.receiverCity.input.value = result.receiverCity;
    if (result.receiverState) fields.receiverState.input.value = result.receiverState;
    if (result.freeTimeMinutesPickup != null) fields.freeTimeHoursPickup.input.value = String(result.freeTimeMinutesPickup / 60);
    if (result.freeTimeMinutesDelivery != null)
      fields.freeTimeHoursDelivery.input.value = String(result.freeTimeMinutesDelivery / 60);
    if (result.ratePerHour != null) fields.ratePerHour.input.value = String(result.ratePerHour);
  }

  const formError = el("p", { class: "form-error", style: "display:none;" });

  const form = el(
    "form",
    {
      class: "card card-pad",
      onsubmit: (e) => {
        e.preventDefault();
        formError.style.display = "none";

        try {
          const load = createLoad(user.id, {
            referenceNumber: fields.referenceNumber.input.value,
            brokerName: fields.brokerName.input.value,
            brokerEmail: fields.brokerEmail.input.value,
            shipperName: fields.shipperName.input.value,
            shipperCity: fields.shipperCity.input.value,
            shipperState: fields.shipperState.input.value,
            receiverName: fields.receiverName.input.value,
            receiverCity: fields.receiverCity.input.value,
            receiverState: fields.receiverState.input.value,
            freeTimeMinutesPickup: Math.round(parseFloat(fields.freeTimeHoursPickup.input.value || "0") * 60),
            freeTimeMinutesDelivery: Math.round(parseFloat(fields.freeTimeHoursDelivery.input.value || "0") * 60),
            ratePerHour: parseFloat(fields.ratePerHour.input.value || "0"),
            pickupAppointmentAt: fromDatetimeLocalValue(fields.pickupAppointmentAt.input.value),
            deliveryAppointmentAt: fromDatetimeLocalValue(fields.deliveryAppointmentAt.input.value),
            rateConText: rateConText.value || null,
          });
          window.location.href = `load.html?id=${load.id}`;
        } catch (err) {
          formError.textContent = err.message;
          formError.style.display = "block";
        }
      },
    },
    [
      section("Load details", [fields.referenceNumber.wrap, fields.brokerName.wrap, fields.brokerEmail.wrap]),
      section("Pickup (shipper)", [
        fields.shipperName.wrap,
        fields.shipperCity.wrap,
        fields.shipperState.wrap,
        fields.pickupAppointmentAt.wrap,
        fields.freeTimeHoursPickup.wrap,
      ]),
      section("Delivery (receiver)", [
        fields.receiverName.wrap,
        fields.receiverCity.wrap,
        fields.receiverState.wrap,
        fields.deliveryAppointmentAt.wrap,
        fields.freeTimeHoursDelivery.wrap,
      ]),
      section("Detention rate", [fields.ratePerHour.wrap]),
      formError,
      el("button", { type: "submit", class: "btn btn-accent btn-block", style: "margin-top:8px;" }, "Create load"),
    ]
  );

  function section(title, children) {
    return el("div", { class: "form-section" }, [
      el("p", { class: "section-label", style: "margin-bottom:12px;" }, title),
      el("div", { class: "form-grid cols-4" }, children),
    ]);
  }

  mount(
    qs("#main-content"),
    el("div", { class: "fade-in", style: "max-width:640px;margin:0 auto;" }, [
      el("h1", {}, "New load"),
      el("p", { class: "subtitle" }, "Paste your rate confirmation to try auto-filling the form, or enter it by hand."),
      el("div", { style: "margin-top:24px;display:flex;flex-direction:column;gap:24px;" }, [parseCard, form]),
    ])
  );
});
