import { useEffect } from "react";

const SITE = "NPT Store";
const BASE_URL = "https://nptstore.in";

// Create or update a <meta> / <link> tag in <head>
const setTag = (selector, create, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
};

const setMeta = (name, content) =>
  setTag(`meta[name="${name}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute("name", name);
    return m;
  }, { content });

const setOg = (property, content) =>
  setTag(`meta[property="${property}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute("property", property);
    return m;
  }, { content });

/**
 * Sets the tab title + SEO tags for a page.
 * useSeo({ title: "About us", description: "...", noindex: false })
 * Use noindex: true for private pages (cart, checkout, account, login).
 */
export default function useSeo({ title, description, noindex = false, path }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : `${SITE} - CAPEX Project Reports`;
    document.title = fullTitle;

    if (description) {
      setMeta("description", description);
      setOg("og:description", description);
    }
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");
    setOg("og:title", fullTitle);
    setOg("og:type", "website");
    setOg("og:site_name", SITE);

    const url = `${BASE_URL}${path ?? window.location.pathname}`;
    setOg("og:url", url);
    setTag('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    }, { href: url });
  }, [title, description, noindex, path]);
}