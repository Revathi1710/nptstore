import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { ProductOption } from "../constants/ProductOption";

// Header items (Year removed)
const MENU_GROUPS = [
  { key: "region", label: "Region" },
  { key: "state", label: "State" },
  { key: "industry", label: "Industry" },
  { key: "segment", label: "Segment" },
];

const PREVIEW_COUNT = 3;
const API = import.meta.env.VITE_API_URL;

// ProductOption is only used to keep a familiar ORDER; it no longer decides what is shown
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

// product.state can be "Gujarat", ["Gujarat","Goa"], { name: "Gujarat" } or "Gujarat, Goa"
const toStrings = (v) => {
  if (v == null) return [];
  if (Array.isArray(v)) return v.flatMap(toStrings);
  if (typeof v === "object") return toStrings(v.name ?? v.value ?? v.label ?? "");
  return String(v).split(",").map((s) => s.trim()).filter((s) => s && s !== "NA");
};

// Reads the products once and keeps ONLY the regions / states / industries / segments that have a product
let presentPromise = null;
const loadPresent = () => {
  if (!presentPromise) {
    presentPromise = (async () => {
      const found = Object.fromEntries(MENU_GROUPS.map((g) => [g.key, new Map()]));
      let page = 1;
      let last = 1;
      let sampleKeys = null;
      do {
        const { data } = await axios.get(`${API}/products`, { params: { per_page: 200, page } });
        const rows = Array.isArray(data.data) ? data.data : [];
        if (!sampleKeys && rows[0]) sampleKeys = Object.keys(rows[0]);
        rows.forEach((p) =>
          MENU_GROUPS.forEach((g) =>
            toStrings(p[g.key]).forEach((v) => {
              const k = v.toLowerCase();
              if (!found[g.key].has(k)) found[g.key].set(k, v);
            })
          )
        );
        last = data.last_page ?? data.meta?.last_page ?? 1;
        page += 1;
      } while (page <= last && page <= 20);

      const out = {};
      MENU_GROUPS.forEach((g) => {
        const map = found[g.key];
        const ordered = [];
        optionList(g.key).forEach((v) => {
          if (map.has(v.toLowerCase())) {
            ordered.push(v);
            map.delete(v.toLowerCase());
          }
        });
        out[g.key] = [...ordered, ...[...map.values()].sort()];
      });

      if (MENU_GROUPS.every((g) => out[g.key].length === 0)) {
        console.warn("MegaNav: no region/state/industry/segment values found on products. Product fields are:", sampleKeys);
      }
      return out;
    })().catch((e) => {
      presentPromise = null; // allow a retry next time
      throw e;
    });
  }
  return presentPromise;
};

function usePresent() {
  const [present, setPresent] = useState(null); // null = loading
  useEffect(() => {
    let alive = true;
    loadPresent().then((r) => alive && setPresent(r)).catch(() => alive && setPresent({}));
    return () => {
      alive = false;
    };
  }, []);
  return present;
}

// ⚠ Replace with the same image logic your ProductCard uses if it differs
const imgCandidates = (p) => {
  const first = p.images?.[0];
  const raw = (typeof first === "string" ? first : first?.url ?? first?.path) || p.image_url || p.image || p.thumbnail;
  if (!raw) return [];
  if (/^(https?:|data:)/.test(raw)) return [raw];
  const clean = String(raw).replace(/^\//, "");
  const origin = (import.meta.env.VITE_STORAGE_URL || API || "").replace(/\/api\/?$/, "").replace(/\/$/, "");
  const list = [`${origin}/${clean}`];
  if (!clean.startsWith("storage/")) list.push(`${origin}/storage/${clean}`);
  list.push(`${origin}/public/${clean}`);
  return list;
};

const filterUrl = (key, value) => `/report?${new URLSearchParams({ [key]: value })}`;

const Chevron = ({ open }) => (
  <svg className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

function ProductTile({ p }) {
  const candidates = imgCandidates(p);
  const [i, setI] = useState(0);
  const src = candidates[i]; // undefined once every candidate has failed
  return (
    <Link to={`/report/${p.slug || p.id}`} className="group block">
      <div className="aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-slate-100">
        {src ? (
          <img src={src} alt={p.name} loading="lazy" onError={() => setI((n) => n + 1)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-slate-400">No image</div>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-snug text-slate-800 group-hover:text-blue-700">{p.name}</p>
    </Link>
  );
}

const TileSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[4/3] rounded-md bg-slate-100" />
    <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
  </div>
);

/* ───────── Desktop: header items + dropdown panel ───────── */
export function MegaNav() {
  const location = useLocation();
  const present = usePresent();
  const [openKey, setOpenKey] = useState(null);
  const [hoverVal, setHoverVal] = useState(null);
  const [cache, setCache] = useState({}); // "state:Gujarat" -> [products]
  const wrapRef = useRef(null);
  const closeTimer = useRef(null);

  // while loading show all four items; afterwards hide any group that has no products
  const groups = useMemo(
    () => (present ? MENU_GROUPS.filter((g) => present[g.key]?.length) : MENU_GROUPS),
    [present]
  );
  const options = openKey ? present?.[openKey] ?? [] : [];
  const group = MENU_GROUPS.find((g) => g.key === openKey);
  const cacheId = openKey && hoverVal ? `${openKey}:${hoverVal}` : null;
  const products = cacheId ? cache[cacheId] : undefined; // undefined = still loading

  const open = (key) => {
    clearTimeout(closeTimer.current);
    if (key !== openKey) {
      setOpenKey(key);
      setHoverVal(present?.[key]?.[0] || null);
    }
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenKey(null), 180); // small delay so the mouse can cross the gap
  };

  // if the lists arrive while a panel is already open, highlight the first option
  useEffect(() => {
    if (openKey && !hoverVal && present?.[openKey]?.length) setHoverVal(present[openKey][0]);
  }, [present, openKey, hoverVal]);

  // close on navigation, Esc and outside click
  useEffect(() => setOpenKey(null), [location.key]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpenKey(null);
    const onDown = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpenKey(null);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      clearTimeout(closeTimer.current);
    };
  }, []);

  // fetch the products for the hovered option (debounced, cached)
  useEffect(() => {
    if (!cacheId || cache[cacheId]) return;
    let alive = true;
    const t = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${API}/products`, {
          params: { [openKey]: hoverVal, per_page: PREVIEW_COUNT },
        });
        const list = (Array.isArray(data.data) ? data.data : []).slice(0, PREVIEW_COUNT);
        if (alive) setCache((c) => ({ ...c, [cacheId]: list }));
      } catch {
        if (alive) setCache((c) => ({ ...c, [cacheId]: [] }));
      }
    }, 150);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [cacheId, cache, openKey, hoverVal]);

  return (
    // NOT "relative": the panel positions against the sticky <header>, so it spans the full width
    <div ref={wrapRef} className="flex items-center gap-1" onMouseEnter={() => clearTimeout(closeTimer.current)} onMouseLeave={scheduleClose}>
      {groups.map((g) => {
        const on = openKey === g.key;
        return (
          <button
            key={g.key}
            type="button"
            aria-haspopup="true"
            aria-expanded={on}
            onMouseEnter={() => open(g.key)}
            onClick={() => (on ? setOpenKey(null) : open(g.key))}
            className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors ${on ? "text-blue-700" : "text-slate-600 hover:text-slate-900"}`}
          >
            {g.label}
            <Chevron open={on} />
            {on && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded bg-blue-700" />}
          </button>
        );
      })}

      {openKey && (
        <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="mx-auto grid max-w-[1400px] grid-cols-[16rem_1fr] gap-6 px-6 py-5">
            {/* left: only the values that have products */}
            <ul className="max-h-80 overflow-y-auto border-r border-slate-100 pr-3" aria-label={group?.label}>
              {!present && <li className="px-3 py-2 text-sm text-slate-500">Loading…</li>}
              {present && options.length === 0 && (
                <li className="px-3 py-2 text-sm text-slate-500">No {group?.label.toLowerCase()} available.</li>
              )}
              {options.map((v) => (
                <li key={v}>
                  <Link
                    to={filterUrl(openKey, v)}
                    onMouseEnter={() => setHoverVal(v)}
                    onFocus={() => setHoverVal(v)}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${hoverVal === v ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    {v}
                    <span aria-hidden="true" className="text-slate-300">›</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* right: related products */}
            <div className="min-w-0">
              {hoverVal && (
                <>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="truncate text-sm font-bold text-slate-900">
                      {group?.label}: {hoverVal}
                    </h3>
                    <Link to={filterUrl(openKey, hoverVal)} className="shrink-0 text-sm font-semibold text-blue-700 hover:underline">
                      View all reports →
                    </Link>
                  </div>

                  {products === undefined ? (
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {[...Array(PREVIEW_COUNT)].map((_, i) => <TileSkeleton key={i} />)}
                    </div>
                  ) : products.length === 0 ? (
                    <p className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                      No reports found for {hoverVal}.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {products.map((p) => <ProductTile key={p.id} p={p} />)}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── Mobile / tablet: simple accordion inside the slide-in panel ───────── */
export function MobileFilters({ onNavigate }) {
  const present = usePresent();
  if (!present) return null;
  return (
    <div className="mt-2 flex flex-col gap-1">
      {MENU_GROUPS.filter((g) => present[g.key]?.length).map((g) => (
        <details key={g.key} className="group rounded-md">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-md border-l-4 border-transparent px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
            {g.label}
            <span className="transition-transform group-open:rotate-180"><Chevron /></span>
          </summary>
          <ul className="max-h-64 overflow-y-auto pb-2 pl-6 pr-2">
            {present[g.key].map((v) => (
              <li key={v}>
                <Link to={filterUrl(g.key, v)} onClick={onNavigate} className="block rounded px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700">
                  {v}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}