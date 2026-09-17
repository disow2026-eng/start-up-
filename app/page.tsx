import Link from "next/link";
import { Nav } from "@/components/marketing/Nav";
import { Faq } from "@/components/marketing/Faq";

export default function LandingPage() {
  return (
    <div className="bg-paper">
      <div className="bg-ink-950">
        <Nav />
        <Hero />
      </div>
      <ProblemSection />
      <HowItWorks />
      <Features />
      <Testimonial />
      <Pricing />
      <FaqSection />
      <FinalCta />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="container-page relative overflow-hidden pb-24 pt-16 sm:pt-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #E8590C 0%, transparent 40%), radial-gradient(circle at 80% 0%, #4A5776 0%, transparent 35%)",
        }}
      />
      <div className="relative grid items-center gap-16 lg:grid-cols-2">
        <div className="animate-fade-up">
          <span className="badge bg-white/10 text-amber-300">For owner-operators &amp; small fleets</span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
            Get paid for every hour <br className="hidden sm:block" />
            you wait at the dock.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-300">
            DockClock timestamps your arrival and departure at every stop, calculates detention
            pay automatically, and turns it into an invoice brokers can&apos;t brush off.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/signup" className="btn-accent px-6 py-3 text-base">
              Start tracking free
            </Link>
            <a href="#how-it-works" className="btn-ghost px-6 py-3 text-base !text-ink-200 hover:!bg-white/10">
              See how it works
            </a>
          </div>
          <p className="mt-6 text-xs text-ink-400">
            No credit card required · Works without AI · Set up your first load in 2 minutes
          </p>
        </div>

        <div className="relative animate-fade-up [animation-delay:150ms]">
          <InvoiceMockup />
        </div>
      </div>
    </section>
  );
}

function InvoiceMockup() {
  return (
    <div className="relative mx-auto max-w-md rotate-1 rounded-2xl border border-white/10 bg-white p-6 shadow-2xl transition-transform duration-500 hover:rotate-0">
      <div className="flex items-center justify-between border-b border-ink-100 pb-4">
        <div>
          <p className="font-display text-sm font-bold text-ink-950">Detention Invoice</p>
          <p className="text-xs text-ink-400">DC-48213</p>
        </div>
        <span className="badge bg-emerald-100 text-emerald-700">Paid</span>
      </div>
      <div className="mt-4 space-y-3">
        <Row label="Pickup — Reyes Produce, McAllen TX" value="1h 40m billable" />
        <Row label="Delivery — Midtown DC, Dallas TX" value="2h 05m billable" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
        <span className="text-sm font-semibold text-ink-600">Total due</span>
        <span className="font-display text-xl font-bold text-amber-600">$187.50</span>
      </div>
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-ink-100">
        <div className="h-full w-full animate-shimmer rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 bg-[length:200%_100%]" />
      </div>
      <p className="mt-2 text-center text-[11px] text-ink-400">Sent → Acknowledged → Paid in 9 days</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-500">{label}</span>
      <span className="font-semibold text-ink-950">{value}</span>
    </div>
  );
}

function ProblemSection() {
  return (
    <section className="container-page py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
          Detention pay is owed. It just never gets collected.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-500">
          Most rate confirmations already promise detention pay after a set amount of free
          time. The problem isn&apos;t the contract — it&apos;s that nobody keeps clean enough
          records to invoice for it, so drivers write it off as the cost of doing business.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        <ProblemCard
          title="No timestamp, no claim"
          body="A text to dispatch or a memory of 'I waited forever' doesn't hold up when a broker pushes back."
        />
        <ProblemCard
          title="Buried in paperwork"
          body="Rate confirmations bury free-time and detention-rate clauses in dense text nobody re-reads at the dock."
        />
        <ProblemCard
          title="Too much friction to chase"
          body="By the time you're home, it's easier to move on to the next load than fight for $80 from three loads ago."
        />
      </div>
    </section>
  );
}

function ProblemCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
      <p className="font-display font-bold text-ink-950">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Log your arrival",
      body: "One tap the moment you check in at the shipper or receiver. DockClock timestamps it — no app fumbling required.",
    },
    {
      n: "02",
      title: "Log your departure",
      body: "Tap again when you pull out. We measure the wait, subtract your free time, and calculate billable detention automatically.",
    },
    {
      n: "03",
      title: "Send the invoice",
      body: "A professional, itemized detention invoice is generated the moment your delivery is complete — ready to email the broker.",
    },
  ];

  return (
    <section id="how-it-works" className="border-y border-ink-100 bg-white py-20 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
            Three taps. Zero paperwork.
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            The whole system runs on two buttons you&apos;re already reaching for at every stop.
          </p>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n} className="relative">
              <span className="font-display text-5xl font-bold text-ink-100">{step.n}</span>
              <p className="mt-3 font-display text-lg font-bold text-ink-950">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: "⏱",
      title: "Automatic detention math",
      body: "Set your free time and rate once — every load calculates billable hours the instant you log a departure.",
    },
    {
      icon: "✨",
      title: "AI rate confirmation parsing",
      body: "Paste a rate confirmation and let AI pull the broker, appointment times, free time, and rate — so you're not re-typing a PDF by hand.",
    },
    {
      icon: "🧾",
      title: "Invoices that hold up",
      body: "Every invoice ships with arrival and departure timestamps baked in, not just a total — the kind of detail that ends disputes fast.",
    },
    {
      icon: "📊",
      title: "See what you're actually owed",
      body: "A running total of detention tracked, sent, and recovered — across every load, every broker, all year.",
    },
  ];

  return (
    <section id="features" className="container-page py-20 sm:py-28">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
          Built around the two minutes you actually have
        </h2>
        <p className="mt-4 text-lg text-ink-500">Not another dashboard to babysit. Just the record you need, when you need it.</p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.title}
            className="group rounded-2xl border border-ink-100 bg-white p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
              {item.icon}
            </span>
            <p className="mt-4 font-display text-lg font-bold text-ink-950">{item.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="bg-ink-950 py-20 sm:py-28">
      <div className="container-page text-center">
        <p className="mx-auto max-w-2xl font-display text-2xl font-medium leading-snug text-white sm:text-3xl">
          &ldquo;I used to eat two or three hours of detention a week and never think twice
          about it. Now it&apos;s an invoice before I even leave the yard.&rdquo;
        </p>
        <p className="mt-6 text-sm font-semibold text-ink-400">— Owner-operator, dry van, Texas triangle</p>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="container-page py-20 sm:py-28">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
          Simple pricing, no surprises
        </h2>
        <p className="mt-4 text-lg text-ink-500">Start free. Upgrade once DockClock starts paying for itself — usually with your first invoice.</p>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
        <PlanCard
          name="Starter"
          price="Free"
          period=""
          body="For drivers trying it out"
          features={["Up to 5 loads / month", "Automatic detention calculation", "Manual load entry", "Printable invoices"]}
          cta="Start free"
          href="/signup"
        />
        <PlanCard
          name="Pro"
          price="$19"
          period="/ truck / mo"
          body="For owner-operators running full-time"
          features={[
            "Unlimited loads",
            "AI rate confirmation parsing",
            "Full claim & payment tracking",
            "Priority email support",
          ]}
          cta="Start free trial"
          href="/signup"
          highlighted
        />
        <PlanCard
          name="Fleet"
          price="Custom"
          period=""
          body="For small fleets & dispatchers"
          features={["Everything in Pro", "Multiple driver seats", "Fleet-wide detention reporting", "API access"]}
          cta="Talk to us"
          href="/signup"
        />
      </div>
    </section>
  );
}

function PlanCard({
  name,
  price,
  period,
  body,
  features,
  cta,
  href,
  highlighted,
}: {
  name: string;
  price: string;
  period: string;
  body: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-7 ${
        highlighted ? "border-ink-950 bg-ink-950 text-white shadow-2xl" : "border-ink-100 bg-white shadow-card"
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber px-3 py-1 text-xs font-bold text-white">
          MOST POPULAR
        </span>
      )}
      <p className={`font-display text-lg font-bold ${highlighted ? "text-white" : "text-ink-950"}`}>{name}</p>
      <p className={`mt-1 text-sm ${highlighted ? "text-ink-300" : "text-ink-500"}`}>{body}</p>
      <div className="mt-5 flex items-baseline gap-1">
        <span className={`font-display text-3xl font-bold ${highlighted ? "text-white" : "text-ink-950"}`}>{price}</span>
        <span className={`text-sm ${highlighted ? "text-ink-400" : "text-ink-400"}`}>{period}</span>
      </div>
      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className={`flex items-start gap-2 ${highlighted ? "text-ink-200" : "text-ink-600"}`}>
            <span className={highlighted ? "text-amber-400" : "text-amber-600"}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-7 w-full text-center ${highlighted ? "btn-accent" : "btn-outline"}`}
      >
        {cta}
      </Link>
    </div>
  );
}

function FaqSection() {
  return (
    <section className="border-t border-ink-100 bg-white py-20 sm:py-28">
      <div className="container-page">
        <h2 className="text-center font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
          Questions, answered
        </h2>
        <Faq />
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="container-page py-20 sm:py-28">
      <div className="relative overflow-hidden rounded-3xl bg-ink-950 px-8 py-16 text-center sm:px-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #E8590C 0%, transparent 55%)" }}
        />
        <div className="relative">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Your next load is going to sit at a dock. Get ready to bill for it.
          </h2>
          <Link href="/signup" className="btn-accent mt-8 inline-flex px-8 py-3.5 text-base">
            Create your free account
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-ink-100 py-10">
      <div className="container-page flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-ink-400">© {new Date().getFullYear()} DockClock. Built for the people who actually drive.</p>
        <div className="flex items-center gap-6 text-sm text-ink-400">
          <Link href="/login" className="hover:text-ink-950">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-ink-950">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
