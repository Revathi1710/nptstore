import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React from "react";
import logo from "../assets/NPT_Store_Logo.png";
import { selectCartCount, fetchCart, resetCartState } from "../store/cartSlice";
import { selectToken, selectUser, logout } from "../store/authSlice";
import CartDrawer from "./CartDrawer";
import { useSelector, useDispatch } from "react-redux";
import { MegaNav, MobileFilters } from "./MegaNav";

// ── data ─────────────────────────────────────────────────────────────────────
const CONTACT = { phone: "+919171015659", email: "sales@newprojectstracker.com" };

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Report", to: "/report" },
];

// The URL a header search goes to. Keep it in ONE place so the format is easy to change.
const searchUrl = (q) => (q ? `/report?search=${encodeURIComponent(q)}` : "/report");

// Home must match exactly; the others also match their sub-pages
// (e.g. /product-view/some-slug highlights "Product", /blogs/some-post highlights "Blog")
const isActive = (pathname, to) =>
  to === "/" ? pathname === "/" : pathname.toLowerCase().startsWith(to);

// ── tiny inline icons ────────────────────────────────────────────────────────
const PATHS = {
  phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  search: "M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z",
  bag: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  orders: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  chevron: "M19 9l-7 7-7-7",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 18L18 6M6 6l12 12",
};
const Ico = ({ n, className = "w-5 h-5", sw = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
    <path d={PATHS[n]} />
  </svg>
);

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/ProjectsTracker/", icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg> },
  { label: "Twitter", href: "https://x.com/NPTrackerOfcl", icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg> },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/11229928/admin/dashboard/", icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg> },
];

const Avatar = ({ initial, className = "h-8 w-8 text-xs" }) => (
  <span className={`flex shrink-0 items-center justify-center rounded-full bg-blue-700 font-bold text-white ${className}`}>{initial}</span>
);

// ── brand block (used in the bar and in the mobile panel) ────────────────────
const Brand = ({ onClick, textClass = "hidden sm:flex lg:hidden xl:flex" }) => (
  <Link to="/" onClick={onClick} className="flex shrink-0 items-center gap-3">
    <img src={logo} alt="NPT Store" className="h-10 w-auto object-contain sm:h-11" />
    <div className={`${textClass} flex-col border-l-2 border-blue-600 pl-3 leading-none`}>
      <span className="text-xl font-extrabold tracking-tight text-slate-900">NPT<span className="text-blue-600">STORE</span></span>
      <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">CAPEX PROJECT REPORTS</span>
    </div>
  </Link>
);

const iconBtn = "flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountMenu, setAccountMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const accountRef = useRef(null);
  const searchRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useSelector(selectCartCount);
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);

  const isLoggedIn = !!token;
  const displayName = user?.name || "Account";
  const firstName = displayName.split(" ")[0];
  const initial = displayName.charAt(0).toUpperCase();

  // After signing in, the user comes back to the page they were on now.
  const signInState = { from: location.pathname + location.search };

  // refetch the cart on mount and whenever the user logs in / out
  useEffect(() => { dispatch(fetchCart()); }, [dispatch, token]);

  // close everything when the page changes
  useEffect(() => {
    setAccountMenu(false); setCartOpen(false); setMobileMenu(false); setSearchOpen(false);
  }, [location.pathname]);

  // shadow after scrolling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // outside click closes the account menu
  useEffect(() => {
    const onDown = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountMenu(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  // Esc closes menus
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { setAccountMenu(false); setMobileMenu(false); setSearchOpen(false); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // lock page scroll while the mobile panel is open
  useEffect(() => {
    if (!mobileMenu) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileMenu]);

  // focus the search box when it opens
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(searchUrl(searchTerm.trim()));
    setSearchTerm(""); setSearchOpen(false); setMobileMenu(false);
  };

  const handleLogout = () => {
    setAccountMenu(false); setMobileMenu(false);
    navigate("/", { replace: true }); // leave protected pages first
    dispatch(logout());
    dispatch(resetCartState());
  };

  return (
    <>
      {/* ───────── top utility bar ───────── */}
      <div className="bg-[#1a2a52] text-blue-100">
        <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between gap-4 px-4 text-xs sm:px-6">
          <div className="flex items-center gap-5">
            <a href={`tel:${CONTACT.phone}`} className="flex items-center gap-2 hover:text-white">
              <Ico n="phone" className="h-3.5 w-3.5" /> {CONTACT.phone}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="hidden items-center gap-2 hover:text-white sm:flex">
              <Ico n="mail" className="h-3.5 w-3.5" /> {CONTACT.email}
            </a>
          </div>
          <div className="flex items-center gap-1">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} title={s.label}
                className="flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-white/15 hover:text-white">
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ───────── main bar (sticky) ───────── */}
      <header className={`sticky top-0 z-50 border-b border-slate-200 bg-white transition-shadow duration-200 ${scrolled ? "shadow-md shadow-slate-900/5" : ""}`}>
        <div className={`mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 transition-[height] duration-200 sm:px-6 ${scrolled ? "h-16" : "h-[72px]"}`}>
          <Brand />

          {/* desktop links + Region / State / Industry / Segment / Year submenus */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {navLinks.map((l) => {
              const on = isActive(location.pathname, l.to);
              return (
                <Link key={l.label} to={l.to} aria-current={on ? "page" : undefined}
                  className={`relative px-3.5 py-2 text-sm font-semibold transition-colors
                    ${on ? "text-blue-700" : "text-slate-600 hover:text-slate-900"}`}>
                  {l.label}
                  {on && <span className="absolute inset-x-3.5 -bottom-[13px] h-0.5 rounded bg-blue-700" />}
                </Link>
              );
            })}
            <MegaNav />
          </nav>

          {/* actions */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button type="button" onClick={() => setSearchOpen((v) => !v)} aria-label="Search reports" aria-expanded={searchOpen}
              className={`${iconBtn} ${searchOpen ? "bg-slate-100 text-blue-700" : ""}`}>
              <Ico n={searchOpen ? "close" : "search"} />
            </button>

            <button type="button" onClick={() => setCartOpen(true)} aria-label={`Open cart (${cartCount} items)`} className={`${iconBtn} relative`}>
              <Ico n="bag" sw={1.8} />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-700 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* account (desktop) */}
            <div className="relative ml-1 hidden lg:block" ref={accountRef}>
              {isLoggedIn ? (
                <>
                  <button type="button" onClick={() => setAccountMenu((v) => !v)} aria-haspopup="menu" aria-expanded={accountMenu}
                    className="flex items-center gap-2 rounded-md border border-slate-200 py-1 pl-1 pr-3 text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50">
                    <Avatar initial={initial} />
                    <span className="max-w-[110px] truncate text-sm font-semibold">{firstName}</span>
                    <Ico n="chevron" className={`h-3.5 w-3.5 text-slate-400 transition-transform ${accountMenu ? "rotate-180" : ""}`} sw={2.5} />
                  </button>

                  {accountMenu && (
                    <div role="menu" className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
                        <Avatar initial={initial} className="h-10 w-10 text-sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                          {user?.email && <p className="truncate text-xs text-slate-500">{user.email}</p>}
                        </div>
                      </div>
                      <div className="p-1.5">
                        <Link to="/myAccount" role="menuitem" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                          <Ico n="user" className="h-4 w-4 text-slate-400" /> My account
                        </Link>
                        <Link to="/my-orders" role="menuitem" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                          <Ico n="orders" className="h-4 w-4 text-slate-400" /> My orders
                        </Link>
                        <button type="button" role="menuitem" onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50">
                          <Ico n="logout" className="h-4 w-4" /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login" state={signInState} className="flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-900">
                  <Ico n="user" className="h-4 w-4" /> Sign in
                </Link>
              )}
            </div>

            {/* hamburger (mobile / tablet) */}
            <button type="button" onClick={() => setMobileMenu(true)} aria-label="Open menu" className={`${iconBtn} border border-slate-200 lg:hidden`}>
              <Ico n="menu" />
            </button>
          </div>
        </div>

        {/* search bar (drops under the header) */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white shadow-lg shadow-slate-900/5">
            <form onSubmit={handleSearch} role="search" className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
              <label htmlFor="header-search" className="sr-only">Search reports</label>
              <div className="flex flex-1 items-center gap-3 rounded-md border border-slate-300 bg-white px-3.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
                <Ico n="search" className="h-4 w-4 text-slate-400" />
                <input id="header-search" ref={searchRef} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search reports by name or code"
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              </div>
              <button type="submit" className="rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900">Search</button>
            </form>
          </div>
        )}
      </header>

      {/* ───────── mobile / tablet slide-in panel ───────── */}
      <div onClick={() => setMobileMenu(false)} aria-hidden="true"
        className={`fixed inset-0 z-[190] bg-slate-900/50 transition-opacity duration-300 lg:hidden ${mobileMenu ? "opacity-100" : "pointer-events-none opacity-0"}`} />

      <aside role="dialog" aria-modal="true" aria-label="Menu" inert={!mobileMenu}
        className={`fixed right-0 top-0 z-[200] flex h-full w-[88%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 lg:hidden ${mobileMenu ? "translate-x-0" : "translate-x-full"}`}>

        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <Brand onClick={() => setMobileMenu(false)} textClass="flex" />
          <button type="button" onClick={() => setMobileMenu(false)} aria-label="Close menu" className={`${iconBtn} border border-slate-200`}>
            <Ico n="close" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <form onSubmit={handleSearch} role="search" className="mb-5 flex items-center gap-2 rounded-md border border-slate-300 pl-3 pr-1 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
            <Ico n="search" className="h-4 w-4 text-slate-400" />
            <input aria-label="Search reports" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search reports"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400" />
            <button type="submit" className="rounded bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white">Go</button>
          </form>

          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navLinks.map((l) => {
              const on = isActive(location.pathname, l.to);
              return (
                <Link key={l.label} to={l.to} onClick={() => setMobileMenu(false)}
                  className={`rounded-md border-l-4 px-4 py-3 text-sm font-semibold transition-colors ${on ? "border-blue-700 bg-blue-50 text-blue-700" : "border-transparent text-slate-700 hover:bg-slate-50"}`}>
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Region / State / Industry / Segment / Year accordion */}
          <MobileFilters onNavigate={() => setMobileMenu(false)} />

          <div className="mt-6 rounded-lg border border-slate-200 p-4">
            {isLoggedIn ? (
              <>
                <div className="mb-3 flex items-center gap-3">
                  <Avatar initial={initial} className="h-10 w-10 text-sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                    {user?.email && <p className="truncate text-xs text-slate-500">{user.email}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/myAccount" onClick={() => setMobileMenu(false)} className="rounded-md border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">My account</Link>
                  <Link to="/my-orders" onClick={() => setMobileMenu(false)} className="rounded-md border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">My orders</Link>
                </div>
                <button type="button" onClick={handleLogout} className="mt-2 w-full rounded-md py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50">Sign out</button>
              </>
            ) : (
              <>
                <p className="mb-3 text-sm text-slate-500">Sign in to see your orders and download your reports.</p>
                <Link to="/login" state={signInState} onClick={() => setMobileMenu(false)} className="block rounded-md bg-blue-700 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-900">Sign in</Link>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2.5 border-t border-slate-200 bg-slate-50 px-4 py-4 text-sm">
          <a href={`tel:${CONTACT.phone}`} className="flex items-center gap-2.5 text-slate-600 hover:text-blue-700"><Ico n="phone" className="h-4 w-4" /> {CONTACT.phone}</a>
          <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2.5 break-all text-slate-600 hover:text-blue-700"><Ico n="mail" className="h-4 w-4 shrink-0" /> {CONTACT.email}</a>
          <div className="flex gap-2 pt-1">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-700">
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </aside>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}