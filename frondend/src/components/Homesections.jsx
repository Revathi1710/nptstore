import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Poppins is used in the design. Add this once in index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
// and in tailwind.config.js: fontFamily: { sans: ["Poppins", "system-ui", "sans-serif"] }

const BTN = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#1A4FE0] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123BB0]";

export const Wrap = ({ className = "", children }) => (
  <div className={`mx-auto max-w-7xl px-4 md:px-8 ${className}`}>{children}</div>
);

export const SectionHead = ({ title, sub }) => (
  <div className="mx-auto mb-9 max-w-2xl text-center">
    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
    {sub && <p className="mt-2 text-[15px] text-slate-500">{sub}</p>}
  </div>
);

/* ───────────── Hero ───────────── 
const TABS = [
  { label: "All", key: "search", hint: 'Try "Gujarat", "Cement" or "Solar"…' },
  { label: "State", key: "state", hint: 'Try "Gujarat" or "Tamil Nadu"…' },
  { label: "Segment", key: "segment", hint: 'Try "Cement" or "Steel"…' },
  { label: "Industry", key: "industry", hint: 'Try "Power" or "Infrastructure"…' },
  { label: "Region", key: "region", hint: 'Try "Western" or "Southern"…' },
];
const POPULAR = ["Maharashtra", "Cement", "Renewable Power", "Steel"];

export function Hero() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(TABS[0]);
  const [q, setQ] = useState("");

  const go = (e) => {
    e.preventDefault();
    const term = q.trim();
    // "All" uses the normal search; other tabs use the same filters as the coverage chips
    navigate(term ? `/product?${new URLSearchParams({ [tab.key]: term })}` : "/product");
  };

  return (
    <div className="bg-gradient-to-b from-[#EAF3FD] to-[#C9E2F7] px-4 pb-16 pt-14 text-center md:pb-[70px] md:pt-16">
      <Link to="/product" className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1A4FE0] shadow-sm">
        <i className="h-[7px] w-[7px] rounded-full bg-[#1A4FE0]" />
        New: H1 2025 state &amp; segment editions →
      </Link>

      <h1 className="mx-auto mb-4 mt-5 max-w-4xl text-4xl font-extrabold leading-[1.12] tracking-[-0.03em] text-slate-900 md:text-[52px]">
        Find your next customer<br /><span className="text-[#1A4FE0]">before your competitors do</span>
      </h1>
      <p className="mx-auto mb-5 max-w-2xl text-base text-slate-600 md:text-[17px]">
        Ready-made reports on new plants, expansions and infrastructure projects across India — with investment, stage, location and promoter contacts for every project. Pick a state or segment and download instantly.
      </p>

      <div className="inline-flex flex-wrap justify-center gap-x-5 gap-y-1 rounded-[22px] bg-white px-6 py-2 text-[13.5px] font-medium shadow-sm md:rounded-full">
        {["Researched since 1994", "Promoter contacts included", "PDF + Excel, instant download"].map((t) => (
          <span key={t} className="flex items-center gap-2"><i className="h-[7px] w-[7px] rounded-full bg-[#1A4FE0]" />{t}</span>
        ))}
      </div>

      <div className="mb-4 mt-6">
        <div className="inline-flex flex-wrap justify-center gap-1 rounded-full bg-white p-1.5 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-[18px] py-[7px] text-[13.5px] font-medium transition ${tab.label === t.label ? "bg-[#1A4FE0] text-white" : "text-slate-700 hover:text-[#1A4FE0]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={go} className="mx-auto flex max-w-[640px] rounded-full bg-white py-1.5 pl-5 pr-1.5 shadow-[0_6px_20px_rgba(26,79,224,0.12)]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tab.hint}
          aria-label="Search reports"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-slate-900 outline-none"
        />
        <button className={`${BTN} rounded-full px-[22px] py-[11px]`}>Search</button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
        <b className="mr-1 text-[11px] tracking-[0.12em]">POPULAR:</b>
        {POPULAR.map((p) => (
          <Link key={p} to={`/product?${new URLSearchParams({ search: p })}`} className="rounded-full bg-white px-3 py-1 font-medium text-slate-900 hover:text-[#1A4FE0]">{p}</Link>
        ))}
      </div>
    </div>
  );
}*/

/* ───────────── Who buys ───────────── */
const WHO = [
  ["E", "EPC contractors", "Spot projects before the tender stage and build your bid pipeline early."],
  ["M", "Equipment manufacturers", "Find plants that will need your machinery — and the people who buy it."],
  ["C", "Engineering consultants", "Reach promoters while designs and approvals are still being decided."],
  ["₹", "Suppliers & financiers", "Track where capital is going, state by state and sector by sector."],
];

export const WhoCard = ({ icon, title, text }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-6">
    <div className="mb-3.5 grid h-11 w-11 place-items-center rounded-[10px] bg-[#EEF3FF] text-lg font-extrabold text-[#1A4FE0]">{icon}</div>
    <h3 className="mb-1.5 text-base font-semibold text-slate-900">{title}</h3>
    <p className="text-sm text-slate-600">{text}</p>
  </div>
);

export function WhoBuys() {
  return (
    <section className="bg-[#F7F9FC] py-16">
      <Wrap>
        <SectionHead title="Built for businesses that sell to new projects" sub="If your growth depends on companies building new plants or expanding old ones, these reports show you who to call next." />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHO.map(([i, t, p]) => <WhoCard key={t} icon={i} title={t} text={p} />)}
        </div>
      </Wrap>
    </section>
  );
}

/* ───────────── What's inside ───────────── */
export function PageMock({ kicker = "MAHARASHTRA · PROJECT 2 OF 12", title = "New Integrated Cement Plant Expansion Project" }) {
  const Lines = ({ n }) => [...Array(n)].map((_, i) => <div key={i} className={`my-[7px] h-1.5 rounded-sm bg-[#E9E3D6] ${i % 2 ? "w-3/5" : ""}`} />);
  return (
    <>
   
 {/*<div aria-hidden="true" className="rotate-[1.2deg] rounded-[10px] border border-slate-200 bg-[#FBF8F2] p-[18px] shadow-[0_20px_40px_rgba(22,38,77,0.12)]">
      <div className="rounded-md border-l-[3px] border-[#D4A55E] bg-[#16264D] px-4 py-3.5 font-serif text-[15px] font-bold text-white">
        <small className="mb-1 block font-sans text-[9px] font-semibold tracking-[0.15em] text-[#D4A55E]">{kicker}</small>
        {title}
      </div>
      <div className="mt-3 grid grid-cols-[1fr_1.2fr] gap-2.5">
        {[["Basic Details", 6], ["Project Details", 7]].map(([h, n]) => (
          <div key={h} className="rounded-md border border-[#E5DDCD] bg-white p-2.5">
            <b className="mb-2 block border-b border-[#C1752E] pb-1.5 font-serif text-[11px] text-[#16264D]">{h}</b>
            <Lines n={n} />
          </div>
        ))}
      </div>
    </div>*/}
     </>
  );
}

const INSIDE = [
  "Project name, promoter company, project type and ownership",
  "Investment, capacity, current stage and completion schedule",
  "Exact location — village, district and state",
  "Promoter address, phone, email and named contact persons",
  "Summary analysis by investment, state, stage and type, plus a company index",
];
export function WhatsInside() {
  return (
    <section className="py-16">
      <Wrap className="text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 md:text-3xl">
            One page per project.<br />Everything you need to make the call.
          </h2>
          <p className="mb-6 mt-3 text-slate-600">
            Every report is compiled from the New Projects Tracker database and laid out so your sales team can act on it straight away.
          </p>

          {/* w-fit + mx-auto centres the block; text-left keeps the ticks aligned */}
          <ul className="mx-auto mb-8 grid w-fit max-w-full gap-3 text-left">
            {INSIDE.map((t) => (
              <li key={t} className="flex gap-3 text-[15px]">
                <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-full bg-[#1A4FE0] text-xs font-bold text-white">✓</span>
                {t}
              </li>
            ))}
          </ul>

          <Link to="/report" className={BTN}>Browse reports &amp; free previews</Link>
        </div>
      </Wrap>
    </section>
  );
}
/* ───────────── How it works ───────────── */
const STEPS = [
  ["Choose a report", "Browse by state, segment, industry or region, or search for what you need."],
  ["Check the free preview", "See the summary pages and a sample project page before you buy."],
  ["Pay and download", "Get the full PDF and the Excel dataset instantly after payment."],
];

export function HowItWorks() {
  return (
    <section className="bg-[#F7F9FC] py-16">
      <Wrap>
        <SectionHead title="How it works" />
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map(([t, p], i) => (
            <div key={t} className="px-5 py-2.5 text-center">
              <div className="mx-auto mb-3.5 grid h-[46px] w-[46px] place-items-center rounded-full bg-[#1A4FE0] text-lg font-bold text-white">{i + 1}</div>
              <h3 className="mb-1.5 text-base font-semibold">{t}</h3>
              <p className="text-sm text-slate-600">{p}</p>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ───────────── FAQ ───────────── */
const FAQS = [
  ["What period does each report cover?", "Each edition covers projects added to the New Projects Tracker database during a fixed half-year (January–June or July–December) or a full calendar year. The exact period is shown on every report page."],
  ["What do I receive after purchase?", "A designed PDF report with one page per project, plus an Excel sheet with the full underlying data — both available for instant download."],
  ["Are contact details included?", "Yes. Wherever available, every project includes the promoter's address, telephone, email and named contact persons."],
  ["Will the report be updated after I buy it?", "No — each report is a one-time snapshot. A new edition is published every six months or every year. For live, daily-updated access, subscribe to New Projects Tracker."],
  ["Can I see a sample before buying?", "Yes. Every report has a free preview showing the summary pages and a sample project page."],
];

export function Faq() {
  return (
    <section className="bg-[#F7F9FC] py-16">
      <Wrap>
        <SectionHead title="Frequently asked questions" />
        <div className="mx-auto max-w-[820px]">
          {FAQS.map(([q, a], i) => (
            <details key={q} open={i === 0} className="group mb-3 rounded-[10px] border border-slate-200 bg-white px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
                {q}
                <span className="text-xl leading-none text-[#1A4FE0] group-open:hidden">+</span>
                <span className="hidden text-xl leading-none text-[#1A4FE0] group-open:inline">–</span>
              </summary>
              <p className="mt-2.5 text-[14.5px] text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ───────────── Upsell ───────────── */
export function Upsell() {
  return (
    <section className="py-16">
      <Wrap>
        <div className="relative flex flex-col items-start justify-between gap-7 overflow-hidden rounded-2xl bg-[#16264D] p-8 text-white md:flex-row md:items-center md:px-12 md:py-11">
          <span className="pointer-events-none absolute -right-14 -top-14 h-[220px] w-[220px] rounded-full bg-[#D4A55E]/15" />
          <div className="relative">
            <h2 className="mb-2 text-2xl font-bold">Need every project, every day?</h2>
            <p className="max-w-[620px] text-[15px] text-[#cfd8ea]">
              Store reports are a fixed snapshot of one state or segment. For live, searchable access to 37,000+ projects across India with daily updates, subscribe to New Projects Tracker.
            </p>
          </div>
          <a href="https://newprojectstracker.com" target="_blank" rel="noreferrer" className="relative whitespace-nowrap rounded-lg bg-[#D4A55E] px-5 py-2.5 text-sm font-semibold text-[#16264D] transition hover:brightness-95">
            Explore NPT subscription →
          </a>
        </div>
      </Wrap>
    </section>
  );
}