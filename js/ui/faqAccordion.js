import { el } from "../lib/dom.js";

const ITEMS = [
  {
    q: "Will brokers actually pay these invoices?",
    a: "Detention pay is usually already written into the rate confirmation or broker-carrier agreement — you're owed it whether or not you invoice for it. DockClock just gives you a timestamped record and a clean invoice so the broker has no reasonable basis to argue the hours.",
  },
  {
    q: "What if I don't have a signed detention rate in writing?",
    a: "You can still log arrival and departure times and set a rate manually — many carriers use a standard rate (e.g. $50/hr after 2 hours) even without a specific clause, and having a documented ask strengthens any dispute.",
  },
  {
    q: "Is my data backed up anywhere?",
    a: "This build stores everything locally in your browser — there's no server. Use the Export Backup button in Settings regularly, since clearing your browser data or switching devices means starting over otherwise.",
  },
  {
    q: "Can my dispatcher or team use this too?",
    a: "The Fleet plan is designed to add multiple seats so a dispatcher can log times on a driver's behalf and track detention across a whole fleet.",
  },
];

export function renderFaq(root) {
  const list = el(
    "div",
    { class: "faq-list" },
    ITEMS.map((item) => {
      const wrap = el("div", { class: "faq-item" });
      const question = el("button", { class: "faq-question" }, [
        el("span", { class: "q-text" }, item.q),
        el("span", { class: "plus" }, "+"),
      ]);
      const answer = el("p", { class: "faq-answer" }, item.a);
      question.addEventListener("click", () => wrap.classList.toggle("open"));
      wrap.append(question, answer);
      return wrap;
    })
  );
  root.append(list);
}
