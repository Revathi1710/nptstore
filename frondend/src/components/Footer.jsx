import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/NPT_Store_Logo.png";

// ── Theme: change these two lines to re-colour the whole footer ───────────────
const BG = "#1a2a52";      // navy background
const ACCENT = "#5acaee";  // hover colour

// ── Content ───────────────────────────────────────────────────────────────────


const RESOURCES = [
  { label: "Home", to: "/" },
  { label: "Reports", to: "/report" },
  { label: "Terms & conditions", to: "/terms" },
  { label: "Privacy policy", to: "/privacy" },
  { label: "Refund policy", to: "/refund-policy" },
];

// Bootstrap Icons class names. Replace "#" with your real profile links.
const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/11229928/admin/dashboard/", icon: "bi-linkedin" },
  { label: "Facebook", href: "https://www.facebook.com/ProjectsTracker/", icon: "bi-facebook" },
  { label: "X (Twitter)", href: "https://x.com/NPTrackerOfcl", icon: "bi-twitter-x" },
];

const LATEST_COUNT = 4;

// ── Small pieces ──────────────────────────────────────────────────────────────
const Heading = ({ children }) => (
  <h3 className="mb-4 border-b border-white/15 pb-3 text-base font-semibold text-white">{children}</h3>
);

const linkClass = "text-sm text-white/80 transition-colors hover:text-[var(--ft-accent)]";

const inr = (n) => Number(n || 0).toLocaleString("en-IN");

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    axios
      .get(`${import.meta.env.VITE_API_URL}/products`, {
        params: { status: "active", sort_by: "year", sort_dir: "desc", per_page: LATEST_COUNT },
      })
      .then(({ data }) => {
        if (alive) setLatest((Array.isArray(data.data) ? data.data : []).slice(0, LATEST_COUNT));
      })
      .catch(() => alive && setLatest([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  return (
    <footer className="text-white" style={{ "--ft-accent": ACCENT, backgroundColor: BG }}>
      <div className="mx-auto max-w-7xl px-4 pt-14 md:px-8">
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.8fr_1.5fr_1fr]">

          {/* Company + contact */}
          <div>
            <Link to="/" className="mb-5 inline-block">
              <img src={logo} alt="NPT Store" className="h-14 w-auto rounded-lg bg-white object-contain p-2" />
            </Link>

            <address className="space-y-3 text-sm not-italic leading-relaxed text-white/80">
                         <p>India's capex project intelligence service, tracking new industrial and infrastructure investments since 1994.

</p>
              <p>
                <span className="block font-semibold text-white">NPT STORE</span>
2nd Floor, 9/25, Kaliamman Koil Street
Raghavendra Colony,<br/> Sai Nagar
Virugambakkam, Chennai 600 092
              </p>
              <p>
                <span className="block font-semibold text-white">Phone</span>
                <a href="tel:+919171015659" className="transition-colors hover:text-[var(--ft-accent)]">+91 91710 15659</a>
              </p>
              <p>
                <span className="block font-semibold text-white">Email</span>
                <a href="mailto:sales@newprojectstracker.com" className="break-all transition-colors hover:text-[var(--ft-accent)]">
                  sales@newprojectstracker.in
                </a>
              </p>
            </address>
          </div>

          {/* Latest reports */}
          <div>
            <Heading>Latest reports</Heading>
            <ul className="space-y-3">
              {loading
                ? [...Array(LATEST_COUNT)].map((_, i) => (
                    <li key={i} className="flex animate-pulse items-center gap-3">
                      <span className="h-14 w-11 shrink-0 rounded bg-white/10" />
                      <span className="h-4 flex-1 rounded bg-white/10" />
                    </li>
                  ))
                : latest.map((p) => (
                    <li key={p.id}>
                      <Link to={`/report/${p.slug}`} className="group flex items-center gap-3">
                        <span className="flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded bg-white/10">
                          {p.images?.length > 0 ? (
                            <img
                              src={`${import.meta.env.VITE_SERVER_URL}/storage/${p.images[0].path}`}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-lg opacity-50">📊</span>
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-sm leading-snug text-white/90 transition-colors group-hover:text-[var(--ft-accent)]">
                            {p.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-white/60">₹{inr(p.active_price || p.price)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
              {!loading && latest.length === 0 && <li className="text-sm text-white/60">No reports to show right now.</li>}
            </ul>
            <Link to="/report" className="mt-4 inline-block text-sm font-semibold text-[var(--ft-accent)] hover:underline">
              View all reports
            </Link>
          </div>

          
          {/* Resources + social */}
          <div>
            <Heading>Quick links</Heading>
            <ul className="mb-8 space-y-3">
              {RESOURCES.map((l) => (
                <li key={l.label}><Link to={l.to} className={linkClass}>{l.label}</Link></li>
              ))}
            </ul>

            <Heading>Follow us</Heading>
            <div className="flex flex-wrap gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-base text-white transition-colors hover:bg-[var(--ft-accent)] hover:text-slate-900"
                >
                  <i className={`bi ${s.icon}`} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/15 py-6 text-center text-sm text-white/70 md:text-left">
          © {currentYear} NPT Store  | Designed by  <a href="https://kariyamangalam.in/" target="_blank">Kariyamangalam Technologies Pvt Ltd.</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;