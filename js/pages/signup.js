import { onReady } from "../lib/domReady.js";
import { qs, el, mount } from "../lib/dom.js";
import { createUser } from "../data/users.js";
import { startSessionForUser, isLoggedIn } from "../data/session.js";
import { isRequired, isEmail, isMinLength } from "../lib/validators.js";

onReady(() => {
  if (isLoggedIn()) {
    window.location.href = "app/dashboard.html";
    return;
  }

  const form = qs("#signup-form");
  const errorSlot = qs("#signup-error");
  const submitBtn = qs("#signup-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    mount(errorSlot, "");

    const companyName = qs("#companyName", form).value;
    const email = qs("#email", form).value;
    const password = qs("#password", form).value;

    if (!isRequired(companyName) || companyName.trim().length < 2) {
      return showError("Company or driver name is required");
    }
    if (!isEmail(email)) return showError("Enter a valid email address");
    if (!isMinLength(password, 8)) return showError("Password must be at least 8 characters");

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account…";

    try {
      const user = await createUser({ companyName, email, password });
      startSessionForUser(user.id);
      window.location.href = "app/dashboard.html";
    } catch (err) {
      showError(err.message);
    }
  });

  function showError(message) {
    mount(errorSlot, el("p", { class: "form-error" }, message));
    submitBtn.disabled = false;
    submitBtn.textContent = "Create account";
  }
});
