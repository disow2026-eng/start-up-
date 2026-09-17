import { onReady } from "../lib/domReady.js";
import { qs, el, mount } from "../lib/dom.js";
import { login, isLoggedIn } from "../data/session.js";

onReady(() => {
  if (isLoggedIn()) {
    window.location.href = "app/dashboard.html";
    return;
  }

  const form = qs("#login-form");
  const errorSlot = qs("#login-error");
  const submitBtn = qs("#login-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    mount(errorSlot, "");
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in…";

    const email = qs("#email", form).value;
    const password = qs("#password", form).value;

    try {
      await login(email, password);
      window.location.href = "app/dashboard.html";
    } catch (err) {
      mount(errorSlot, el("p", { class: "form-error" }, err.message));
      submitBtn.disabled = false;
      submitBtn.textContent = "Log in";
    }
  });
});
