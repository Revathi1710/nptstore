import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { addToCart, selectCartItems } from "../store/cartSlice";
import { ProductOption } from "../constants/ProductOption";
import { ProductCard, SkeletonCard, Toast } from "../components/ProductCard";
import { reportUrl, findFilter } from "../utils/reportUrl";

const FILTERS = [
  { key: "state", label: "State", all: "All states" },
  { key: "region", label: "Region", all: "All regions" },
  { key: "segment", label: "Segment", all: "All segments" },
  { key: "industry", label: "Industry", all: "All industries" },
  { key: "year", label: "Year", all: "All years" },
];

const SORTS = {
  year_desc: { label: "Year: Newest to Oldest", params: { sort_by: "year", sort_dir: "desc" } },
  year_asc: { label: "Year: Oldest to Newest", params: { sort_by: "year", sort_dir: "asc" } },
  latest: { label: "Latest Created", params: { sort_by: "created_at", sort_dir: "desc" } },
  price_asc: { label: "Price: Low to High", params: { sort_by: "price", sort_dir: "asc" } },
  price_desc: { label: "Price: High to Low", params: { sort_by: "price", sort_dir: "desc" } },
  name: { label: "Name: A to Z", params: { sort_by: "name", sort_dir: "asc" } },
};

const SITE_NAME = "NPT Store";

const fallbackYears = () => {
  const y = new Date().getFullYear();
  return Array.from({ length: 8 }, (_, i) => String(y + 1 - i));
};

const pageList = (cur, last) => {
  const nums = [...new Set([1, last, cur - 1, cur, cur + 1])].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push(`gap-${n}`);
    out.push(n);
  });
  return out;
};

const pageBtn = "h-9 min-w-9 rounded-md border px-2 text-sm font-medium transition";

const Chevron = ({ open }) => (
  <svg className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const FilterGroup = ({ label, value, options, onChange, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [q, setQ] = useState("");
  const list = value && !options.includes(value) ? [value, ...options] : options;
  const shown = q ? list.filter((o) => o.toLowerCase().includes(q.toLowerCase())) : list;

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex w-full items-center justify-between py-3.5 text-left">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          {label}
          {value && <span className="rounded bg-blue-700 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">1</span>}
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="pb-4">
          {list.length > 8 && (
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Find ${label.toLowerCase()}…`}
              aria-label={`Find ${label.toLowerCase()}`}
              className="mb-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white" />
          )}
          <ul className="max-h-52 space-y-0.5 overflow-y-auto pr-1">
            {shown.map((o) => {
              const on = o === value;
              return (
                <li key={o}>
                  <button type="button" onClick={() => onChange(on ? "" : o)} aria-pressed={on}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors
                      ${on ? "bg-blue-50 font-semibold text-blue-800" : "text-slate-600 hover:bg-slate-50"}`}>
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${on ? "border-blue-600" : "border-slate-300"}`}>
                      {on && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                    </span>
                    <span className="min-w-0 break-words">{o}</span>
                  </button>
                </li>
              );
            })}
            {shown.length === 0 && <li className="px-2 py-2 text-xs text-slate-400">No match</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

const FilterPanel = ({ idPrefix, searchInput, onSearchInput, onSearchSubmit, filters, options, onFilter, onClear, activeCount }) => (
  <div>
    <form onSubmit={onSearchSubmit} role="search" className="mb-5">
      <label htmlFor={`${idPrefix}-search`} className="mb-1.5 block text-xs font-semibold text-slate-600">Search reports</label>
      <div className="relative">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.3-4.3" />
        </svg>
        <input id={`${idPrefix}-search`} value={searchInput} onChange={(e) => onSearchInput(e.target.value)}
          placeholder="Name or code…" autoComplete="off"
          className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
        {searchInput && (
          <button type="button" onClick={() => onSearchInput("")} aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>
    </form>

    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
      <h2 className="text-sm font-bold text-slate-900">Filters</h2>
      {activeCount > 0 && (
        <button type="button" onClick={onClear} className="text-xs font-semibold text-blue-700 hover:underline">Clear all</button>
      )}
    </div>

    {FILTERS.map(({ key, label }) => {
      const opts = (options[key] || []).map(String).filter((v) => v !== "NA");
      if (opts.length === 0 && !filters[key]) return null;
      return (
        <FilterGroup key={key} label={label} value={filters[key] || ""} options={opts}
          onChange={(v) => onFilter(key, v)} defaultOpen={key === "state" || !!filters[key]} />
      );
    })}
  </div>
);

export const AllProduct = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Route is /report/:slug, so on a listing page the slug is one filter value
  const { slug } = useParams();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const gridRef = useRef(null);

  const [options, setOptions] = useState(ProductOption || {});

  const search = searchParams.get("search") || "";
  const sort = SORTS[searchParams.get("sort")] ? searchParams.get("sort") : "year_desc";
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;

  // /report/Maharashtra, /report/Other-Manufacturing, /report/2026 ... -> which filter is in the path
  const pathFilter = slug ? findFilter(slug) : null;

  const filters = {};
  FILTERS.forEach(({ key }) => {
    const v = pathFilter?.key === key ? pathFilter.value : searchParams.get(key);
    if (v) filters[key] = v;
  });
  const filterKey = JSON.stringify(filters);
  const hasFilters = Object.keys(filters).length > 0;
  const activeCount = Object.keys(filters).length + (search ? 1 : 0);

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [searchInput, setSearchInput] = useState(search);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const lastApplied = useRef(search);
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Dynamic Title Generator
  const getHeadingText = () => {
    if (search) return `Results for “${search}”`;

    const activeKeys = Object.keys(filters);
    if (activeKeys.length === 0) return "All reports";

    if (activeKeys.length === 1) {
      const key = activeKeys[0];
      const val = filters[key];
      if (key === "region") return `${val} Region Reports`;
      if (key === "state") return `${val} State Reports`;
      if (key === "segment") return `${val} Segment Reports`;
      if (key === "industry") return `${val} Industry Reports`;
      if (key === "year") return `${val} Project Reports`;
    }

    const summary = activeKeys.map((k) => filters[k]).join(" • ");
    return `Filtered Reports (${summary})`;
  };

  const headingText = getHeadingText();

  // ── SEO ──────────────────────────────────────────────────────────────────
  // Title: "Maharashtra State Reports | NPT Store" (+ "– Page 2" on later pages)
  const seoTitle = `${headingText}${page > 1 ? ` – Page ${page}` : ""} | ${SITE_NAME}`;

  // Description: built from the active filter heading so every listing page is unique
  const seoDescription = (
    search
      ? `Search results for “${search}” on ${SITE_NAME}: new plants, expansions and infrastructure project reports with promoter contacts, as PDF + Excel.`
      : `${headingText}: new plants, expansions and infrastructure project reports with promoter contacts, delivered as PDF + Excel on ${SITE_NAME}.`
  ).slice(0, 160);

  // Canonical: clean path-based URL (filters + page only; sort and search are dropped)
  const canonicalUrl = `${window.location.origin}${reportUrl({ ...filters, search: "", sort: "", page: page > 1 ? String(page) : "" })}`;

  // Internal search results shouldn't be indexed, but links on them can be followed
  const robots = search ? "noindex, follow" : "index, follow";

  // Default share image (add /og-default.png to your public folder, or change the path)
  const seoImage = `${window.location.origin}/og-default.png`;

  const showToast = (message, type) => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/product-filters`)
      .then((r) => {
        if (r.data?.data && Object.keys(r.data.data).length > 0) setOptions(r.data.data);
      })
      .catch(() => setOptions(ProductOption || {}));
  }, []);

  const optionsWithYear = options.year?.length ? options : { ...options, year: fallbackYears() };

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const params = { page, status: "active", ...SORTS[sort].params, ...filters };
        if (search) params.search = search;
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/products`, { params });
        if (!alive) return;
        setProducts(Array.isArray(data.data) ? data.data : []);
        setMeta(data.meta || data);
      } catch (err) {
        console.error("Failed to load products:", err);
        if (alive) { setProducts([]); setMeta(null); }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [search, sort, page, filterKey]);

  // Build the next URL from the current state + a patch.
  // One filter goes into the path (/report/Maharashtra), the rest stay in the query string.
  const apply = (patch, opts) => {
    navigate(
      reportUrl({
        ...filters,
        search,
        sort: sort === "year_desc" ? "" : sort,
        page: "",
        ...patch,
      }),
      opts
    );
  };

  const setFilter = (key, value) => apply({ [key]: value });
  const setSort = (value) => apply({ sort: value === "year_desc" ? "" : value });

  const applySearch = (value) => {
    lastApplied.current = value;
    apply({ search: value }, { replace: true });
  };

  const clearAll = () => {
    setSearchInput("");
    lastApplied.current = "";
    navigate("/report");
  };

  const goToPage = (n) => {
    apply({ page: n === 1 ? "" : String(n) });
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (search !== lastApplied.current) {
      lastApplied.current = search;
      setSearchInput(search);
    }
  }, [search]);

  useEffect(() => {
    const value = searchInput.trim();
    if (value === lastApplied.current) return;
    const t = setTimeout(() => applySearch(value), 450);
    return () => clearTimeout(t);
  }, [searchInput]);

  const submitSearch = (e) => { e.preventDefault(); applySearch(searchInput.trim()); setFiltersOpen(false); };

  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e) => e.key === "Escape" && setFiltersOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [filtersOpen]);

  const handleAdd = async (product) => {
    if (cartItems.some((i) => i.product_id === product.id)) {
      showToast("This report is already in your cart", "error");
      return;
    }
    try {
      setAddingId(product.id);
      await dispatch(addToCart({
        product_id: product.id,
        quantity: 1,
        name: product.name,
        price: product.price,
        active_price: product.active_price,
        image: product.images?.[0]?.path || null,
      })).unwrap();
      showToast("Added to cart", "success");
    } catch {
      showToast("Couldn't add this report. Try again.", "error");
    } finally {
      setAddingId(null);
    }
  };

  const total = meta?.total;
  const noun = total === 1 ? "report" : "reports";

  const panelProps = {
    searchInput, onSearchInput: setSearchInput, onSearchSubmit: submitSearch,
    filters, options: optionsWithYear, onFilter: setFilter, onClear: clearAll, activeCount,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="robots" content={robots} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={seoImage} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={seoImage} />
      </Helmet>

      <Toast {...toast} />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 md:px-8">
        <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8">

          {/* Sidebar */}
          <aside aria-label="Search and filters"
            className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto rounded-lg border border-slate-200 bg-white p-4">
            <FilterPanel {...panelProps} idPrefix="desk" />
          </aside>

          {/* Results */}
          <section ref={gridRef} className="min-w-0 scroll-mt-28">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  {headingText}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {total !== undefined ? `${total} ${noun}${activeCount ? " match your criteria" : ""}` : "Loading reports"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setFiltersOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-500 lg:hidden">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M6 12h12M10 19h4" /></svg>
                  Filters
                  {activeCount > 0 && <span className="rounded-full bg-blue-700 px-1.5 text-[11px] font-bold leading-5 text-white">{activeCount}</span>}
                </button>

                <label className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="hidden sm:inline">Sort by</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                    {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
                  </select>
                </label>
              </div>
            </div>

            {/* Chips */}
            {(hasFilters || search) && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {search && (
                  <button type="button" onClick={() => { setSearchInput(""); applySearch(""); }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 py-1 pl-3 pr-2 text-xs font-semibold text-blue-800 hover:bg-blue-100">
                    Search: {search} <span aria-hidden="true" className="text-sm leading-none">×</span>
                  </button>
                )}
                {FILTERS.filter(({ key }) => filters[key]).map(({ key, label }) => (
                  <button key={key} type="button" onClick={() => setFilter(key, "")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 py-1 pl-3 pr-2 text-xs font-semibold text-blue-800 hover:bg-blue-100">
                    {label}: {filters[key]} <span aria-hidden="true" className="text-sm leading-none">×</span>
                  </button>
                ))}
                <button type="button" onClick={clearAll} className="ml-1 text-xs font-semibold text-slate-500 hover:text-blue-700 hover:underline">Clear all</button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center">
                <p className="font-semibold text-slate-800">No reports found</p>
                <p className="mt-1 text-sm text-slate-500">Remove a filter or search for a different state or industry.</p>
                {activeCount > 0 && (
                  <button onClick={clearAll} className="mt-5 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} p={p}
                    inCart={cartItems.some((i) => i.product_id === p.id)}
                    adding={addingId === p.id}
                    onAdd={handleAdd} />
                ))}
              </div>
            )}

            {meta && meta.last_page > 1 && (
              <nav className="mt-12 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
                <button onClick={() => goToPage(Math.max(1, page - 1))} disabled={page === 1}
                  className={`${pageBtn} border-slate-300 bg-white text-slate-700 hover:border-slate-500 disabled:pointer-events-none disabled:opacity-40`}>
                  Previous
                </button>
                {pageList(page, meta.last_page).map((n) =>
                  typeof n === "string" ? (
                    <span key={n} className="px-1 text-slate-400">…</span>
                  ) : (
                    <button key={n} onClick={() => goToPage(n)} aria-current={page === n ? "page" : undefined}
                      className={`${pageBtn} ${page === n ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"}`}>
                      {n}
                    </button>
                  )
                )}
                <button onClick={() => goToPage(Math.min(meta.last_page, page + 1))} disabled={page === meta.last_page}
                  className={`${pageBtn} border-slate-300 bg-white text-slate-700 hover:border-slate-500 disabled:pointer-events-none disabled:opacity-40`}>
                  Next
                </button>
              </nav>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Drawer */}
      <div onClick={() => setFiltersOpen(false)} aria-hidden="true"
        className={`fixed inset-0 z-[190] bg-slate-900/50 transition-opacity duration-300 lg:hidden ${filtersOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside role="dialog" aria-modal="true" aria-label="Search and filters" inert={!filtersOpen}
        className={`fixed left-0 top-0 z-[200] flex h-full w-[88%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 lg:hidden ${filtersOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Search and filters</h2>
          <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <FilterPanel {...panelProps} idPrefix="mob" />
        </div>
        <div className="border-t border-slate-200 p-4">
          <button type="button" onClick={() => setFiltersOpen(false)}
            className="w-full rounded-md bg-blue-700 py-3 text-sm font-semibold text-white hover:bg-slate-900">
            {total !== undefined ? `Show ${total} ${noun}` : "Show reports"}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default AllProduct;