import { el } from "../lib/dom.js";

export function invoiceTable(rows) {
  return el("table", { class: "table", style: "border:1px solid var(--ink-100);border-radius:12px;overflow:hidden;" }, [
    el(
      "thead",
      {},
      el("tr", { style: "background:var(--ink-50);" }, [
        el("th", {}, "Stop"),
        el("th", {}, "Arrived"),
        el("th", {}, "Departed"),
        el("th", { style: "text-align:right;" }, "Free time"),
        el("th", { style: "text-align:right;" }, "Billable"),
      ])
    ),
    el(
      "tbody",
      {},
      rows.map((row) =>
        el("tr", {}, [
          el("td", { style: "font-weight:600;color:var(--ink-800);" }, row.stop),
          el("td", { style: "color:var(--ink-600);" }, row.arrived),
          el("td", { style: "color:var(--ink-600);" }, row.departed),
          el("td", { style: "text-align:right;color:var(--ink-600);" }, row.freeTime),
          el("td", { style: "text-align:right;font-weight:700;color:var(--ink-950);" }, row.billable),
        ])
      )
    ),
  ]);
}
