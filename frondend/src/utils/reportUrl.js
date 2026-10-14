import { ProductOption } from "../constants/ProductOption";

// Filters that can appear in the path. Year is handled separately (4 digits).
const PATH_KEYS = ["state", "region", "industry", "segment"];
// When several filters are active, the first one in this order goes in the path,
// the rest stay in the query string.
const PRIORITY = [...PATH_KEYS, "year"];

// Reads an option list from ProductOption even if it is named "state", "states", "STATES"...
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

const safeDecode = (s) => {
  try {
    return decodeURIComponent(s || "");
  } catch {
    return s || "";
  }
};

// "Tamil Nadu" -> "Tamil-Nadu"
export const toSlug = (s) => String(s).trim().replace(/\s+/g, "-");

// "Tamil-Nadu" -> { key: "state", value: "Tamil Nadu" }
// "2026"       -> { key: "year",  value: "2026" }
// anything else (a report slug) -> null
export const findFilter = (slug) => {
  const s = safeDecode(slug).trim().replace(/\s+/g, "-").toLowerCase();
  if (!s) return null;
  if (/^\d{4}$/.test(s)) return { key: "year", value: s };
  for (const key of PATH_KEYS) {
    const hit = optionList(key).find((o) => toSlug(o).toLowerCase() === s);
    if (hit) return { key, value: hit };
  }
  return null;
};

// { state, region, industry, segment, year, search, sort, page }
//   -> "/report/Maharashtra?year=2026&segment=Other+Manufacturing"
export const reportUrl = (params = {}) => {
  let pathKey = null;
  let pathPart = "";

  for (const key of PRIORITY) {
    const v = params[key];
    if (!v) continue;
    const hit = findFilter(toSlug(v));
    // only use the path if the value reads back as the same filter (no clash / unknown value)
    if (hit && hit.key === key && hit.value === String(v)) {
      pathKey = key;
      pathPart = `/${encodeURIComponent(toSlug(v))}`;
      break;
    }
  }

  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && k !== pathKey) qs.set(k, v);
  });
  const q = qs.toString();
  return `/report${pathPart}${q ? `?${q}` : ""}`;
};