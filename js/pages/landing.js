import { onReady } from "../lib/domReady.js";
import { qs } from "../lib/dom.js";
import { renderMarketingNav } from "../ui/navbarMarketing.js";
import { renderFaq } from "../ui/faqAccordion.js";
import { renderFooter } from "../ui/footer.js";
import { isLoggedIn } from "../data/session.js";

onReady(() => {
  renderMarketingNav(qs("#nav-root"));
  renderFaq(qs("#faq-root"));
  renderFooter(qs("#footer-root"));

  // If already logged in, send returning visitors straight to their
  // dashboard instead of the pitch.
  const cta = qs("#hero-cta-primary");
  if (cta && isLoggedIn()) {
    cta.textContent = "Go to dashboard";
    cta.href = "app/dashboard.html";
  }
});
