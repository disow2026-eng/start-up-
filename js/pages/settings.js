import { onReady } from "../lib/domReady.js";
import { qs, el, mount } from "../lib/dom.js";
import { requireUser } from "../ui/authGuard.js";
import { renderSidebar } from "../ui/sidebar.js";
import { renderMobileTabBar } from "../ui/mobileTabBar.js";
import { formField } from "../ui/formField.js";
import { updateUserSettings } from "../data/users.js";
import { exportAllData, importAllData } from "../data/backup.js";
import { downloadJson, readJsonFile } from "../lib/download.js";
import { pickJsonFile } from "../ui/fileImport.js";
import { confirmModal } from "../ui/confirmModal.js";
import { showToast } from "../ui/toast.js";

onReady(() => {
  let user = requireUser();
  if (!user) return;

  renderSidebar(qs("#sidebar-root"), { activeKey: "settings", companyName: user.companyName });
  renderMobileTabBar(qs("#tabbar-root"), { activeKey: "settings" });

  const companyName = formField({ label: "Company / driver name", id: "companyName", required: true, value: user.companyName });
  const mcNumber = formField({ label: "MC number (optional)", id: "mcNumber", value: user.mcNumber || "" });
  const freeTime = formField({
    label: "Default free time (hours)",
    id: "defaultFreeTimeHours",
    type: "number",
    step: "0.25",
    value: String(user.defaultFreeTimeMinutes / 60),
  });
  const rate = formField({
    label: "Default rate ($/hr)",
    id: "defaultRatePerHour",
    type: "number",
    step: "0.01",
    value: String(user.defaultRatePerHour),
  });

  const saveMsg = el("p", { class: "form-success" });

  const settingsForm = el(
    "form",
    {
      class: "card card-pad",
      style: "max-width:520px;",
      onsubmit: (e) => {
        e.preventDefault();
        user = updateUserSettings(user.id, {
          companyName: companyName.input.value.trim(),
          mcNumber: mcNumber.input.value.trim() || null,
          defaultFreeTimeMinutes: Math.round(parseFloat(freeTime.input.value || "0") * 60),
          defaultRatePerHour: parseFloat(rate.input.value || "0"),
        });
        mount(saveMsg, "Saved.");
        setTimeout(() => mount(saveMsg, ""), 2500);
      },
    },
    [
      companyName.wrap,
      mcNumber.wrap,
      el("div", { class: "form-grid", style: "margin-top:16px;" }, [freeTime.wrap, rate.wrap]),
      el(
        "p",
        { style: "margin-top:12px;font-size:12px;color:var(--ink-400);" },
        "These pre-fill every new load — override them per load whenever a rate confirmation says otherwise."
      ),
      el("div", { style: "margin-top:16px;display:flex;align-items:center;gap:12px;" }, [
        el("button", { type: "submit", class: "btn btn-accent" }, "Save changes"),
        saveMsg,
      ]),
    ]
  );

  const dataCard = el("div", { class: "card card-pad", style: "max-width:520px;margin-top:24px;" }, [
    el("p", { class: "section-label" }, "Your data"),
    el(
      "p",
      { style: "margin-top:8px;font-size:14px;color:var(--ink-600);line-height:1.5;" },
      "Everything DockClock knows lives only in this browser (no server, no account recovery). Export a backup regularly, and import it if you switch browsers or devices."
    ),
    el("div", { style: "margin-top:16px;display:flex;gap:12px;flex-wrap:wrap;" }, [
      el(
        "button",
        {
          class: "btn btn-outline",
          onclick: () => downloadJson(`dockclock-backup-${Date.now()}.json`, exportAllData()),
        },
        "Export backup"
      ),
      el(
        "button",
        {
          class: "btn btn-outline",
          onclick: () =>
            pickJsonFile(async (file) => {
              const ok = await confirmModal({
                title: "Import backup?",
                body: "This replaces all data currently stored in this browser with the contents of the backup file. This can't be undone.",
                confirmLabel: "Import and replace",
                danger: true,
              });
              if (!ok) return;
              try {
                const payload = await readJsonFile(file);
                importAllData(payload);
                showToast("Backup imported — reloading…", { type: "success" });
                setTimeout(() => window.location.reload(), 1000);
              } catch (err) {
                showToast(err.message || "Could not read that file", { type: "error" });
              }
            }),
        },
        "Import backup"
      ),
    ]),
  ]);

  const noteCard = el("div", { class: "card card-pad", style: "max-width:520px;margin-top:24px;" }, [
    el("p", { class: "section-label" }, "Rate confirmation parsing"),
    el(
      "p",
      { style: "margin-top:8px;font-size:14px;color:var(--ink-600);line-height:1.5;" },
      "The New Load screen can pattern-match fields out of pasted rate confirmation text. It's plain JavaScript regex, not AI — this is a static site with no server, so there's nowhere safe to hold an API key. It won't catch everything; always double-check the fields it fills in."
    ),
  ]);

  mount(
    qs("#main-content"),
    el("div", { class: "fade-in" }, [
      el("h1", {}, "Settings"),
      el("p", { class: "subtitle" }, "Your company info and default detention terms."),
      el("div", { style: "margin-top:24px;" }, [settingsForm, dataCard, noteCard]),
    ])
  );
});
