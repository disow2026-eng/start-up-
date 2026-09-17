import { el, mount } from "../lib/dom.js";
import { stopWaitMinutes, stopDetentionMinutes } from "../core/detention.js";
import { formatMinutes } from "../lib/time.js";

// Renders a small "wait time" widget that ticks every 15s while a stop is
// in progress (arrived but not yet departed), without needing a full page
// reload. Returns a stop() function to clear the interval if the caller
// re-renders the page around it.
export function mountLiveElapsed(container, { arrivedAt, departedAt, freeTimeMinutes }) {
  function render() {
    if (!arrivedAt) {
      mount(container, el("div", {}, [
        el("p", { class: "stat-label" }, "Wait time"),
        el("p", { style: "font-family:var(--font-display);font-size:18px;font-weight:800;color:var(--ink-300);" }, "—"),
      ]));
      return;
    }

    const wait = stopWaitMinutes(arrivedAt, departedAt);
    const detentionMins = stopDetentionMinutes(arrivedAt, departedAt, freeTimeMinutes);
    const isLive = !departedAt;

    mount(
      container,
      el("div", {}, [
        el("p", { class: "stat-label" }, isLive ? "Wait time (live)" : "Wait time"),
        el(
          "p",
          {
            style: `font-family:var(--font-display);font-size:18px;font-weight:800;color:${
              isLive ? "var(--amber-600)" : "var(--ink-950)"
            };`,
          },
          formatMinutes(wait)
        ),
        detentionMins > 0
          ? el("p", { style: "font-size:12px;font-weight:700;color:var(--amber-600);" }, `${formatMinutes(detentionMins)} billable`)
          : null,
      ])
    );
  }

  render();

  let intervalId = null;
  if (arrivedAt && !departedAt) {
    intervalId = setInterval(render, 15000);
  }

  return () => intervalId && clearInterval(intervalId);
}
