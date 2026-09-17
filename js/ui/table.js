import { el } from "../lib/dom.js";

// columns: [{ header, cell(row) -> Node|string, hideOnMobile }]
export function dataTable(columns, rows) {
  const thead = el(
    "thead",
    {},
    el(
      "tr",
      {},
      columns.map((col) =>
        el("th", { class: col.hideOnMobile ? "hide-sm" : "" }, col.header)
      )
    )
  );

  const tbody = el(
    "tbody",
    {},
    rows.map((row) =>
      el(
        "tr",
        {},
        columns.map((col) => el("td", { class: col.hideOnMobile ? "hide-sm" : "" }, col.cell(row)))
      )
    )
  );

  return el("table", { class: "table" }, [thead, tbody]);
}
