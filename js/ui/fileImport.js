import { el } from "../lib/dom.js";

// Wraps the awkward "hidden file input triggered by a styled button" pattern
// used for the settings page's "Import backup" action.
export function pickJsonFile(onFile) {
  const input = el("input", {
    type: "file",
    accept: "application/json",
    style: "display:none;",
    onchange: (e) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
      input.remove();
    },
  });
  document.body.append(input);
  input.click();
}
