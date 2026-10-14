import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, ShieldCheck, Zap, Database, FileText, CheckCircle2 } from "lucide-react";
import useSeo from "../hooks/useSeo";
const FEATURES = [
  { icon: Zap, title: "Emerging projects", desc: "Real-time tracking of new industrial developments." },
  { icon: BarChart3, title: "Market trends", desc: "In-depth analysis of shifting dynamics and pricing." },
  { icon: ShieldCheck, title: "Verified data", desc: "Manually vetted reports to reduce investment risk." },
  { icon: Database, title: "Lead generation", desc: "Direct project leads for your sales force." },
];

const About = () => {
  useSeo({                               // ← 2. add this call here
    title: "About Us - Industrial Project Intelligence India",
    description: "New Projects Tracker (NPT) provides verified industrial project reports and market research across India. Buy PDF or Excel reports with no subscription.",
  });
  return (
    <div className="bg-slate-50 text-slate-800">

      {/* Hero: same light blue as the home banner */}
      <section className="border-b border-blue-100 bg-gradient-to-b from-[#EFF6FF] via-[#F4F8FF] to-[#EBF3FE] px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-5 inline-block rounded-full border border-blue-200 bg-white px-4 py-1.5 text-sm font-semibold text-blue-700">
            Industrial intelligence
          </p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Actionable data for
            <span className="block text-blue-600">strategic growth</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            New Projects Tracker (NPT) is your destination for verified project intelligence and industrial market research reports across India.
          </p>
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20 md:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
              Fuel your business with verified intelligence
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              At <strong className="font-semibold text-slate-900">NPT Report Store</strong>, we simplify how businesses access critical industrial data.
              Our research is designed for process equipment manufacturers, engineering providers and industrial suppliers who need to stay ahead of market shifts.
            </p>

            <div className="my-8 rounded-r-lg border-l-4 border-blue-600 bg-blue-50 p-5 sm:p-6">
              <h3 className="flex items-center gap-2 font-semibold text-blue-900">
                <CheckCircle2 size={20} /> No subscription required
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-blue-900/80">
                Choose individual reports in <strong>PDF or Excel</strong> formats and pay only for the data you need. It works well for targeted marketing and sales pipelines.
              </p>
            </div>

            <Link to="/report" className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
              Browse report titles <ArrowRight size={18} />
            </Link>
          </div>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="rounded-lg border border-slate-200 bg-white p-6">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                  <Icon size={20} />
                </span>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Formats: same navy as the footer */}
      <section className="bg-[#1a2a52] px-4 py-14 sm:py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Data your way</h2>
            <p className="mt-4 text-base leading-relaxed text-blue-100/80 sm:text-lg">
              Whether you need a polished presentation for your board or raw data for your CRM, we provide the right format for your workflow.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-white">
              <li className="flex items-center gap-2"><FileText size={20} className="text-sky-300" /> PDF reports</li>
              <li className="flex items-center gap-2"><Database size={20} className="text-sky-300" /> Excel databases</li>
            </ul>
          </div>

          <div className="w-full rounded-lg border border-white/15 bg-white/5 p-6 md:w-auto">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">N</span>
              <div>
                <p className="font-semibold text-white">Chennai-based intelligence</p>
                <p className="text-sm text-blue-100/70">New Projects Tracker Research Services</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-14 text-center sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">Find the report you need</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Our team is ready to help you find high-impact project data. Pick the specific report you need and take control of your market growth.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/report" className="rounded-md bg-blue-700 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">
              View reports and prices
            </Link>
            <Link to="/contact" className="rounded-md border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-500">
              Contact our sales team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;