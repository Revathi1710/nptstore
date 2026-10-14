import React from "react";
import { Link } from "react-router-dom";
import { reportUrl } from "../utils/reportUrl";

export const inr = (n) => Number(n || 0).toLocaleString("en-IN");

// state -> /report/Maharashtra, anything else -> /report?industry=Chemicals
const tagLink = (key, value) => reportUrl({ [key]: String(value) });

export const Toast = ({ message, type }) => (
  <div
    role="status"
    className={`fixed bottom-6 right-6 z-[60] transition duration-300 ${message ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}`}
  >
    <div className={`flex items-center gap-3 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg border-l-4 ${type === "success" ? "border-emerald-400" : "border-rose-400"}`}>
      {message}
    </div>
  </div>
);

export const SkeletonCard = () => (
  <div className="rounded-lg border border-slate-200 bg-white overflow-hidden animate-pulse">
    <div className="aspect-[3/4] bg-slate-100" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-1/3 bg-slate-100 rounded" />
      <div className="h-4 w-full bg-slate-100 rounded" />
      <div className="h-4 w-2/3 bg-slate-100 rounded" />
    </div>
  </div>
);

export const ProductCard = ({ p, inCart, adding, onAdd }) => {
  const price = Number(p.active_price || p.price) || 0;
  const hasDiscount = p.active_price && Number(p.price) > Number(p.active_price);

  return (
    <article className="group flex flex-col rounded-lg border border-slate-200 bg-white overflow-hidden transition-colors hover:border-slate-400">
      <Link
        to={`/report/${p.slug}`}
        className="relative flex aspect-[3/4] items-center justify-center bg-slate-100 p-4 border-b border-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700"
      >
        {p.images?.length > 0 ? (
          <img
            src={`${import.meta.env.VITE_SERVER_URL}/storage/${p.images[0].path}`}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-contain shadow-md ring-1 ring-slate-900/5"
          />
        ) : (
          <div className="text-4xl text-slate-300">📊</div>
        )}
        {p.year && (
          <span className="absolute left-3 top-3 rounded bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
            {p.year}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {(p.state || p.industry || p.format) && (
          <p className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            {p.state && (
              <Link to={tagLink("state", p.state)} className="font-medium text-slate-600 hover:text-blue-700 hover:underline">
                {p.state}
              </Link>
            )}
            {p.state && p.industry && <span className="text-slate-300">|</span>}
            {p.industry && (
              <Link to={tagLink("industry", p.industry)} className="truncate hover:text-blue-700 hover:underline">
                {p.industry}
              </Link>
            )}
            {p.format && <span className="rounded border border-slate-200 px-1.5 text-slate-600">{p.format}</span>}
          </p>
        )}

        <Link to={`/report/${p.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-slate-900 group-hover:text-blue-700">
            {p.name}
          </h3>
        </Link>
        {p.total_projects && <p className="mt-1 line-clamp-1 text-xs text-slate-500">{p.total_projects}</p>}

        <div className="mt-auto  gap-2 pt-4">
          <div>
            <p className="text-lg font-bold leading-none text-slate-900">₹{inr(price)}</p>
            {hasDiscount && <p className="mt-1 text-xs text-slate-400 line-through">₹{inr(p.price)}</p>}
          </div>
        {/*  <button
            onClick={() => onAdd(p)}
            disabled={adding}
            className={`inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-60
              ${inCart ? "border border-emerald-300 bg-emerald-50 text-emerald-700" : "bg-blue-700 text-white hover:bg-slate-900"}`}
          >
            {adding ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : inCart ? (
              "In cart"
            ) : (
              "Add to cart"
            )}
          </button>*/}
     <Link
  to={`/report/${p.slug}`}
  className="mt-3 inline-flex h-9 w-full items-center justify-center whitespace-nowrap rounded-md bg-blue-700 px-2 text-[11px] font-semibold text-white transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-60 sm:text-xs"
>
  Download Sample / Buy Now
</Link>
        </div>
      </div>
    </article>
  );
};