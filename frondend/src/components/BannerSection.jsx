import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ProductOption } from "../constants/ProductOption";

const ALL_REPORTS_PATH = "/report";

const GROUPS = [
  { key: "state", label: "State", tone: "bg-emerald-50 text-emerald-700 border border-emerald-200/60" },
  { key: "segment", label: "Segment", tone: "bg-blue-50 text-blue-700 border border-blue-200/60" },
  { key: "industry", label: "Industry", tone: "bg-violet-50 text-violet-700 border border-violet-200/60" },
  { key: "region", label: "Region", tone: "bg-amber-50 text-amber-700 border border-amber-200/60" },
  { key: "year", label: "Year", tone: "bg-rose-50 text-rose-700 border border-rose-200/60" },
];
const SCOPES = [{ key: "all", label: "All" }, ...GROUPS.filter((g) => g.key !== "year")];
const groupOf = (key) => GROUPS.find((g) => g.key === key);

// Finds the option list for a filter even if ProductOption names it "state", "states",
// "STATES", "State"…, and accepts plain strings or { value / label / name } objects.
const optionList = (key) => {
  const cap = key[0].toUpperCase() + key.slice(1);
  const plural = key === "industry" ? "industries" : `${key}s`;
  const names = [key, plural, key.toUpperCase(), plural.toUpperCase(), cap, plural[0].toUpperCase() + plural.slice(1)];
  for (const name of names) {
    const list = ProductOption?.[name];
    if (Array.isArray(list) && list.length) {
      return list
        .map((x) => String(x && typeof x === "object" ? x.value ?? x.label ?? x.name ?? "" : x))
        .filter((s) => s && s !== "NA");
    }
  }
  return [];
};

const RECENT_KEY = "npt_recent_searches";
const MAX_RECENT = 5;
const loadRecent = () => {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(v) ? v.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
};
const saveRecent = (list) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
};
const KEYWORD_TONE = "bg-blue-50/80 text-blue-700 border border-blue-200/60";

const Icon = ({ d, className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    {d}
  </svg>
);
const searchIcon = (
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </>
);

const BannerSection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(searchParams.get("search") || "");
  const [scope, setScope] = useState("all");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState(loadRecent);
  const boxRef = useRef(null); // wraps the tabs AND the search box, so clicking a tab never counts as "outside"

  useEffect(() => {
    setInput(searchParams.get("search") || "");
  }, [searchParams]);

  // Tell the developer (console) if a filter has no option list, instead of failing silently
  useEffect(() => {
    const missing = GROUPS.filter((g) => optionList(g.key).length === 0).map((g) => g.key);
    if (missing.length) {
      console.warn(
        `BannerSection: no options found for [${missing.join(", ")}]. ProductOption keys are:`,
        Object.keys(ProductOption || {})
      );
    }
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  // Open the list AND scroll the search box up, so the suggestions are visible
  const openMenu = () => {
    setOpen(true);
    const el = boxRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top > window.innerHeight * 0.4) window.scrollBy({ top: top - 140, behavior: "smooth" });
  };

  const q = input.trim().toLowerCase();

  const groups = useMemo(() => {
    if (!q && scope === "all") return [];
    const base = scope === "all" ? GROUPS : GROUPS.filter((g) => g.key === scope);
    return base
      .map((g) => {
        const items = optionList(g.key)
          .filter((v) => !q || v.toLowerCase().includes(q))
          .sort((a, b) => Number(b.toLowerCase().startsWith(q)) - Number(a.toLowerCase().startsWith(q)))
          // "All" tab: a few per group. A specific tab (e.g. State): the whole list, scrollable.
          .slice(0, scope === "all" ? 4 : 100);
        return { ...g, items };
      })
      .filter((g) => g.items.length);
  }, [q, scope]);

  // Flat list for keyboard navigation
  const flat = useMemo(() => {
    const rows = q ? [{ type: "search" }] : [];
    groups.forEach((g) => g.items.forEach((v) => rows.push({ type: "option", key: g.key, value: v })));
    return rows;
  }, [groups, q]);

  const update = (mutate) => {
    const next = Object.fromEntries(searchParams);
    delete next.page;
    mutate(next);
    setSearchParams(next);
  };

  const remember = (entry) => {
    const next = [entry, ...recent.filter((r) => !(r.key === entry.key && r.value === entry.value))].slice(0, MAX_RECENT);
    setRecent(next);
    saveRecent(next);
  };

  const clearRecent = () => {
    setRecent([]);
    saveRecent([]);
  };

  const go = (mutate) => {
    const next = Object.fromEntries(searchParams);
    delete next.page;
    mutate(next);
    navigate(`${ALL_REPORTS_PATH}?${new URLSearchParams(next).toString()}`);
  };

  const choose = (row) => {
    setOpen(false);
    setActive(-1);
    if (row.type === "search") {
      const term = row.value ?? input.trim();
      remember({ key: "search", value: term });
      go((n) => {
        n.search = term;
      });
    } else {
      setInput("");
      remember({ key: row.key, value: row.value });
      go((n) => {
        n[row.key] = row.value;
        delete n.search;
      });
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (active >= 0 && flat[active]) return choose(flat[active]);
    setOpen(false);
    if (input.trim()) remember({ key: "search", value: input.trim() });
    go((n) => {
      input.trim() ? (n.search = input.trim()) : delete n.search;
    });
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      openMenu();
      setActive((a) => Math.min(flat.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(-1, a - 1));
    }
  };

  // Show the list when there are rows, or (on a specific tab / with text) a clear "nothing found" message
  const hasRows = flat.length > 0;
  const showDropdown = open && (hasRows || scope !== "all" || !!q);
  const activeFilters = GROUPS.filter((g) => searchParams.get(g.key));
  const scopeLabel = scope === "all" ? "state, segment, industry or report name" : `a ${scope}`;

  return (
    // No overflow-hidden here (it would clip the suggestion list). z-20 keeps it above the sections below.
    <section className="relative z-20 bg-gradient-to-b from-[#EFF6FF] via-[#F4F8FF] to-[#EBF3FE] border-b border-blue-100/80 bannercontainer">
      {/* Glow effects: clipped in their own layer so they can't cause scrollbars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/50 rounded-full filter blur-3xl opacity-60 -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-sky-200/40 rounded-full filter blur-3xl opacity-50 translate-y-1/3" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-10 pt-10 text-center md:pb-16 md:pt-16">

        {/* Release Pill Tag */}
        <div className="bg-white inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <Link to="/report"> New: H1 2025 state &amp; segment editions →</Link>
          <span className="text-blue-600">→</span>
        </div>

        <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl">
         Find your next customer
          <span className="block text-blue-600">before your competitors do
</span>
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base md:text-lg">
         Ready-made reports on new plants, expansions and infrastructure projects across India — with investment, stage, location and promoter contacts for every project. Pick a state or segment and download instantly.


        </p>

        {/* Feature Highlights: hidden on phones so the search box stays near the top */}
        <ul className="mx-auto mt-3 hidden w-fit max-w-full flex-wrap justify-center gap-x-6 gap-y-2 rounded-full border border-blue-100 bg-white/80 backdrop-blur-sm px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm sm:flex">
          {["Researched since 1994", "Promoter contacts included", "PDF + Excel, instant download"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              {t}
            </li>
          ))}
        </ul>

        {/* Tabs + search share ONE wrapper (boxRef) so a tab click is never treated as an outside click */}
        <div ref={boxRef}>
          {/* Scope tabs stay on ONE row and scroll sideways on small screens */}
          <div
            role="tablist"
            aria-label="Search by"
            className="mx-auto mt-5 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-blue-100 bg-white/90 backdrop-blur-md p-1.5 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {SCOPES.map((s) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={scope === s.key}
                onClick={() => {
                  setScope(s.key);
                  setActive(-1);
                  openMenu();
                }}
                className={`shrink-0 rounded-full px-4 py-2 text-xs sm:px-5 sm:text-sm font-semibold transition ${
                  scope === s.key ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-600 hover:text-blue-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Search Input + Dropdown Box */}
          <div className="relative mx-auto mt-3 max-w-3xl text-left">
            <form onSubmit={submit} role="search" className="flex items-center rounded-full border border-blue-200/80 bg-white p-1.5 shadow-xl shadow-blue-950/5 focus-within:ring-2 focus-within:ring-blue-500 sm:p-2">
              <label htmlFor="report-search" className="sr-only">Search reports</label>
              <input
                id="report-search"
                type="text"
                autoComplete="off"
                role="combobox"
                aria-expanded={showDropdown}
                aria-controls="search-suggestions"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  openMenu();
                  setActive(-1);
                }}
                onFocus={openMenu}
                onKeyDown={onKeyDown}
                placeholder={scope === "all" ? "Search state, segment, industry…" : `Search by ${scopeLabel}`}
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 md:text-base font-medium"
              />
              {input && (
                <button type="button" aria-label="Clear search" onClick={() => { setInput(""); setActive(-1); }} className="mr-1 rounded-full p-2 text-slate-400 hover:text-slate-700 sm:mr-2">
                  <Icon d={<path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />} />
                </button>
              )}
              <button type="submit" aria-label="Search" className="flex shrink-0 items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 px-4 py-3 text-sm font-bold text-white transition shadow-md shadow-blue-500/20 active:scale-95 sm:px-6">
                <Icon d={searchIcon} /> <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {/* Autocomplete Dropdown: same width as the search box; height follows the screen */}
            {showDropdown && (
              <ul id="search-suggestions" role="listbox" className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[min(24rem,60vh)] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl shadow-blue-950/10">
                {!hasRows ? (
                  <li className="px-4 py-3 text-sm text-slate-500">
                    {q ? `No ${scope === "all" ? "matches" : scope + " matches"} for “${input.trim()}”.` : `No ${scope} options are available.`}
                  </li>
                ) : (
                  (() => {
                    let idx = -1;
                    const row = (r, content) => {
                      idx += 1;
                      const i = idx;
                      return (
                        <li key={i} role="option" aria-selected={active === i}>
                          <button
                            type="button"
                            onMouseEnter={() => setActive(i)}
                            onClick={() => choose(r)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors sm:px-4 ${active === i ? "bg-blue-50/80" : "hover:bg-slate-50"}`}
                          >
                            {content}
                          </button>
                        </li>
                      );
                    };
                    return (
                      <>
                        {q && (
                          <>
                            <li className="px-3 pb-1 pt-2 text-xs font-bold text-slate-400 uppercase tracking-wider sm:px-4">Search all</li>
                            {row({ type: "search" }, (
                              <span className="min-w-0">
                                <span className="block truncate font-bold text-slate-900">Search “{input.trim()}”</span>
                                <span className="text-xs text-blue-600 font-medium">across all reports</span>
                              </span>
                            ))}
                          </>
                        )}
                        {groups.map((g) => (
                          <React.Fragment key={g.key}>
                            <li className="px-3 pb-1 pt-3 text-xs font-bold text-slate-400 uppercase tracking-wider sm:px-4">{g.label}</li>
                            {g.items.map((v) =>
                              row({ type: "option", key: g.key, value: v }, (
                                <>
                                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${g.tone}`}>{g.label}</span>
                                  <span className="min-w-0 text-slate-800 font-medium">{v}</span>
                                </>
                              ))
                            )}
                          </React.Fragment>
                        ))}
                      </>
                    );
                  })()
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Active Filters / Recent Searches */}
        {activeFilters.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filtered by:</span>
            {activeFilters.map((g) => (
              <button
                key={g.key}
                onClick={() => update((n) => { delete n[g.key]; })}
                className="flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-800 shadow-sm hover:border-blue-400 transition"
              >
                <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${g.tone}`}>{g.label}</span>
                {searchParams.get(g.key)}
                <span aria-label="Remove filter" className="text-slate-400 font-bold hover:text-slate-700">×</span>
              </button>
            ))}
          </div>
        ) : recent.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent:</span>
            {recent.map((r) => {
              const g = groupOf(r.key);
              return (
                <button
                  key={r.key + r.value}
                  onClick={() => (r.key === "search" ? choose({ type: "search", value: r.value }) : choose({ type: "option", key: r.key, value: r.value }))}
                  className="flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
                >
                  <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${g ? g.tone : KEYWORD_TONE}`}>{g ? g.label : "Keyword"}</span>
                  {r.value}
                </button>
              );
            })}
            <button onClick={clearRecent} className="text-xs font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2 ml-1">
              Clear
            </button>
          </div>
        ) : null}

      </div>
    </section>
  );
};

export default BannerSection;