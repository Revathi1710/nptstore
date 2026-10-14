import React from "react";
import { Link } from "react-router-dom";

// Each image needs its own default import (PNG files can't be destructured).
// Change the file names if yours are different.
import south from "../assets/south.png";
import north from "../assets/north.png";
import west from "../assets/west.png";
import central from "../assets/central.png";
import eastern from "../assets/eastern.png";

// "value" must match the region names in your ProductOption (REGIONS) list.
const REGIONS = [
  { value: "Southern", label: "South India", image: south },
  { value: "Northern", label: "North India", image: north },
  { value: "West", label: "West India", image: west },
  { value: "Central", label: "Central India", image: central },
  { value: "Eastern", label: "East India", image: eastern },
];

export const RegionProduct = () => {
  return (
    <section className="border-b border-slate-200 bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Browse by region</h2>
          <p className="mt-1 text-sm text-slate-500">Choose a region to see its project reports.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {REGIONS.map((r, i) => (
            <Link
              key={r.value}
              to={`/report?${new URLSearchParams({ region: r.value }).toString()}`}
              className={`group overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 ${i === REGIONS.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}
            >
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-100">
                <img src={r.image} alt={`${r.label} map`} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 px-3 py-3 sm:px-4">
                <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-700">{r.label}</span>
                <svg className="h-4 w-4 text-slate-400 group-hover:text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RegionProduct;