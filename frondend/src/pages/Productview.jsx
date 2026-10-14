import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCart, selectCartItems } from "../store/cartSlice";
import { setBuyNowProduct } from "../store/buyNowSlice";
import { selectUser } from "../store/authSlice";
import SampleRequestModal from "../components/SampleRequestModal";
import RichText from "../components/RichText";
import { ProductCard } from "../components/ProductCard";
import { Wrap, SectionHead, WhoCard, Upsell } from "../components/Homesections";
import { Helmet } from "react-helmet-async";

// ── tiny inline icons (no extra dependency) ──────────────────────────────────
const ICONS = {
  shield:   "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  mail:     "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  headset:  "M3 18v-6a9 9 0 0118 0v6M3 18a2 2 0 002 2h1a1 1 0 001-1v-5a1 1 0 00-1-1H3zm18 0a2 2 0 01-2 2h-1a1 1 0 01-1-1v-5a1 1 0 011-1h3z",
  cart:     "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z",
  bolt:     "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  file:     "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  check:    "M5 13l4 4L19 7",
  x:        "M6 18L18 6M6 6l12 12",
};
const Ico = ({ n, className = "w-4 h-4", fill = false }) => (
  <svg className={className} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={ICONS[n]} />
  </svg>
);

const TABS = [
  { key: "description_overview",      label: "Overview" },
  { key: "description_top_companies", label: "Top Companies Covered" },
  { key: "description_whats_inside",  label: "What's Inside" },
  { key: "description_faq",           label: "FAQ" },
];

const TRUST = [
  ["shield", "Researched & reviewed"], ["download", "Instant download"],
  ["mail", "Copy sent to your email"], ["headset", "Phone & email support"],
];

const DO = [
  ["1", "Build a prospect list in an hour", "Filter the Excel by segment, district or investment size and hand your sales team a ready call list."],
  ["2", "Reach the right person", "Every project lists the promoter's address, phone, email and named contacts wherever available."],
  ["3", "Time your approach", "Project stage and completion schedule tell you which projects are buying now and which are next."],
];

const INSIDE = [
  "Promoter, industry, project type, ownership and stage",
  "Products & capacity, investment and completion schedule",
  "Location, district and state",
  "Full project background and current status",
  "Address, phone, email and contact persons",
];

// SEO helpers: strip HTML/newlines from highlights and trim to a clean meta description
const cleanText = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const truncate = (s, n = 160) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/\s+\S*$/, "")}…`);

const fmtSize = (b) => (!b ? "" : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`);

// Shown when the product has no uploaded image: builds the cover from product data
const Cover = ({ p }) => (
  <div className="flex aspect-[3/4] w-full flex-col rounded-md border border-slate-200 bg-[#FBF8F2] p-6 shadow-[0_14px_30px_rgba(22,38,77,0.10)]">
    <p className="text-[8px] font-semibold tracking-[0.15em] text-slate-500">NEW PROJECTS TRACKER · CAPEX TRACKER SERIES</p>
    <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#16264D]">{p.state || p.segment || p.industry}</p>
    <p className="font-serif text-xl font-extrabold leading-snug text-[#16264D]">{p.name}</p>
    <div className="mt-4 flex-1 rounded border-l-4 border-[#D4A55E] bg-[#16264D] p-5 font-serif text-lg font-bold text-white">
      {p.total_projects ? `${p.total_projects} new projects tracked` : "Capex project intelligence"}
    </div>
  </div>
);

const LABEL = "mb-2.5 mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1A4FE0]";

export default function ProductView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const user = useSelector(selectUser);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [sampleOpen, setSampleOpen] = useState(false);
  const [tab, setTab] = useState("description_overview");
  const [related, setRelated] = useState([]);
  const [relAddingId, setRelAddingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // timers kept in refs so they can be cleared on unmount
  const toastTimer = useRef(null);
  const cartTimer = useRef(null);
  useEffect(() => () => {
    clearTimeout(toastTimer.current);
    clearTimeout(cartTimer.current);
  }, []);

  // keep cart in sync after a refresh
  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  // load product (with cancel guard so a stale response can't overwrite a newer one)
  useEffect(() => {
    let alive = true;
    setLoading(true); setMainImg(0); setTab("description_overview"); setRelated([]);
    (async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/product-by-slug/${slug}`);
        if (alive) setProduct(data.data);
      } catch (err) {
        console.error(err);
        if (alive) setProduct(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  // related reports: same region (falls back to latest), excluding this one
  useEffect(() => {
    if (!product) return;
    let alive = true;
    (async () => {
      try {
        const params = { per_page: 5, sort: "latest" };
        if (product.region) params.region = product.region;
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/products`, { params });
        const list = Array.isArray(data.data) ? data.data : [];
        if (alive) setRelated(list.filter((r) => r.id !== product.id).slice(0, 4));
      } catch {
        if (alive) setRelated([]);
      }
    })();
    return () => { alive = false; };
  }, [product]);

  const showToast = (message, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ show: true, message, type });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (cartItems.some((i) => i.product_id === product.id)) {
      showToast("This item is already in your cart", "error");
      return;
    }
    setAddingToCart(true);
    try {
      await dispatch(addToCart({ product_id: product.id, quantity: 1 })).unwrap();
      setCartAdded(true);
      showToast("Added to cart successfully!");
      clearTimeout(cartTimer.current);
      cartTimer.current = setTimeout(() => setCartAdded(false), 3000);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to add to cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddRelated = async (p) => {
    if (cartItems.some((i) => i.product_id === p.id)) {
      showToast("This report is already in your cart", "error");
      return;
    }
    try {
      setRelAddingId(p.id);
      await dispatch(
        addToCart({
          product_id: p.id,
          quantity: 1,
          name: p.name,
          price: p.price,
          active_price: p.active_price,
          image: p.images?.[0]?.path || null,
        })
      ).unwrap();
      showToast("Added to cart successfully!");
    } catch {
      showToast("Couldn't add this report. Try again.", "error");
    } finally {
      setRelAddingId(null);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    setBuyingNow(true);
    dispatch(setBuyNowProduct({
      id: product.id, name: product.name, price: product.price,
      active_price: product.active_price,
      image: product.images?.[0]?.path || null,
      code: product.code, format: product.format,
    }));
    navigate("/checkout?flow=buynow");
  };

  // tabs that actually have content (Overview always shows)
  const visibleTabs = useMemo(
    () => (product ? TABS.filter((t) => t.key === "description_overview" || product[t.key]?.trim()) : []),
    [product]
  );

  /* ── loading / not found ── */
  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-[#1A4FE0] rounded-full animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Loading product…</p>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-slate-600 font-semibold mb-4">Product not found.</p>
          <button onClick={() => navigate("/")} className="bg-[#1A4FE0] text-white font-bold text-sm px-6 py-2.5 rounded-lg">Back to Home</button>
        </div>
      </div>
    );

  const images = product.images || [];
  const price = Number(product.active_price) || Number(product.price) || 0;

  // original (struck-through) price: only when it is filled in and higher than the selling price
  const originalPrice = Number(product.original_price) || 0.00;

  
  const hasDiscount = originalPrice > price && price > 0;
  const savePct = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0;

  // time_limit is free text typed in the admin, e.g. "Launch price through 31 October 2026"
  const offerText = String(product.time_limit ?? "").trim();
  const hasSample = !!product.pdf_sample;
  const reportType = product.state ? "State report" : "Segment report";

  // each chip links to the product list filtered by that value, e.g. /report?state=Chandigarh
  const coverage = [
    { key: "state",    label: "State",    value: product.state },
    { key: "region",   label: "Region",   value: product.region },
    { key: "segment",  label: "Segment",  value: product.segment },
    { key: "industry", label: "Industry", value: product.industry },
    { key: "year",     label: "Period",   value: product.year },
  ].filter((c) => c.value);

  // rows only appear when the product has that value
  const specs = [
    { label: "Period covered",   value: product.period },
    { label: "Projects",         value: product.total_projects },
    { label: "Pages",            value: product.pages },
    { label: "Total investment", value: product.total_investment },
    { label: "Segments",         value: product.segments_count },
    { label: "Format",           value: product.format || "PDF + Excel" },
    { label: "Published in",     value: product.published_in },
    { label: "Product code",     value: product.code },
  ].filter((s) => s.value);

  const subtitle =
    product.short_description ||
    `New plants, expansions and infrastructure projects${product.state ? ` in ${product.state}` : ""}${product.published_in ? `, published ${product.published_in}` : ""} — one page each, with promoter contacts.`;

  const imgSrc = (path) => `${import.meta.env.VITE_SERVER_URL}/storage/${path}`;

  // ── SEO values (adjust field names / canonical path to match your API & routes) ──
  const seoTitle = product.meta_title || `${product.name} | ${product.format || "PDF + Excel"} Report`;
  // description comes from the product's highlights, falling back to the subtitle
  const seoDescription = truncate(cleanText(product.highlights) || cleanText(subtitle));
  const canonicalUrl = `${window.location.origin}/product/${product.slug || slug}`;
  // image comes from the product's first uploaded image, falling back to a site default
  const seoImage = images[0]?.path
    ? imgSrc(images[0].path)
    : `${window.location.origin}/og-default.png`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="product" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:image:alt" content={product.name} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={seoImage} />
      </Helmet>

      <div className="bg-white">
        {/* toast */}
        <div className={`fixed bottom-6 right-6 z-[1500] flex items-center gap-3 bg-white rounded-2xl shadow-2xl px-5 py-4 border-l-4 transition-all duration-300
          ${toast.type === "success" ? "border-green-500" : "border-red-500"}
          ${toast.show ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${toast.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
            <Ico n={toast.type === "success" ? "check" : "x"} className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{toast.message}</p>
            {toast.type === "success" && (
              <button onClick={() => navigate("/cart")} className="text-xs font-bold text-[#1A4FE0] hover:underline">View Cart →</button>
            )}
          </div>
        </div>

        <Wrap className="pb-5">
          {/* breadcrumb */}
          <nav className="flex flex-wrap items-center gap-2 pb-1.5 pt-5 text-[13px] text-slate-500">
            <Link to="/" className="hover:text-[#1A4FE0]">Home</Link>›
            <Link to="/report" className="hover:text-[#1A4FE0]">Reports</Link>›
            <span className="max-w-[60vw] truncate font-medium text-slate-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            {/* ───────── LEFT: cover + trust ───────── */}
            <div className="lg:sticky lg:top-24">
              <div className="rounded-[14px] border border-slate-200 bg-white p-6 md:p-[30px]">
                {images.length > 0 ? (
                  <div className="flex items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-[#FBF8F2] p-4 shadow-[0_14px_30px_rgba(22,38,77,0.10)]">
                    <img src={imgSrc(images[mainImg].path)} alt={product.name} className="max-h-[480px] w-auto max-w-full object-contain" />
                  </div>
                ) : (
                  <Cover p={product} />
                )}
                {images.length > 1 && (
                  <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                      <button key={img.id ?? i} onClick={() => setMainImg(i)}
                        className={`h-[68px] w-[68px] shrink-0 rounded-lg border-2 bg-white p-1.5 transition
                          ${mainImg === i ? "border-[#1A4FE0] ring-4 ring-blue-100" : "border-slate-200 opacity-60 hover:opacity-100"}`}>
                        <img src={imgSrc(img.path)} alt="" className="h-full w-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {TRUST.map(([n, t]) => (
                  <div key={t} className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-3.5 py-[11px] text-[13px] font-semibold">
                    <span className="text-[#1A4FE0]"><Ico n={n} /></span>{t}
                  </div>
                ))}
              </div>
            </div>

            {/* ───────── RIGHT: buy box ───────── */}
            <div className="rounded-[14px] border border-slate-200 bg-white p-6 md:p-[30px]">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-[#16264D] px-2.5 py-[5px] text-[11.5px] font-bold uppercase tracking-wider text-white">{product.code}</span>
                <span className="rounded-md border border-[#CFDCFB] bg-[#EEF3FF] px-2.5 py-[5px] text-[11.5px] font-bold uppercase tracking-wider text-[#1A4FE0]">{product.format || "PDF / Excel"}</span>
                <span className="rounded-md border border-[#EFD9B3] bg-[#FBF1E1] px-2.5 py-[5px] text-[11.5px] font-bold uppercase tracking-wider text-[#8A5A1C]">{reportType}</span>
              </div>

              <h1 className="mb-2 mt-4 text-[26px] font-extrabold leading-tight tracking-tight text-slate-900 md:text-[32px]">{product.name}</h1>
              <p className="text-[15px] text-slate-600">{subtitle}</p>

              <div className="mb-1 mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[40px] font-extrabold leading-none tracking-tight text-slate-900">₹{price.toLocaleString("en-IN")}</span>
                {hasDiscount && (
                  <span className="text-[40px] font-semibold leading-none text-rose-500 line-through decoration-2">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
                {hasDiscount && savePct > 0 && (
                  <span className="rounded-md bg-rose-50 px-2 py-1 text-[12px] font-bold leading-none text-rose-600">{savePct}% off</span>
                )}
                <span className="text-[13px] text-slate-500">+ GST · one-time purchase</span>
              </div>
              {offerText && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] font-semibold text-rose-700">
                  <span aria-hidden="true">⏳</span>
                  <span>{offerText}</span>
                </div>
              )}
              <div className="mb-5 mt-3 rounded-lg bg-[#F7F9FC] px-3.5 py-2.5 text-[13px] text-slate-600">
                Need all of India, updated daily?{" "}
                <a href="https://newprojectstracker.com" target="_blank" rel="noreferrer" className="font-semibold text-[#1A4FE0]">See NPT subscription →</a>
              </div>

              {/* coverage chips */}
              {coverage.length > 0 && (
                <>
                  <p className={LABEL}>Coverage <span className="font-medium normal-case tracking-normal text-slate-400">· click to see related reports</span></p>
                  <div className="flex flex-wrap gap-2">
                    {coverage.map((c) => (
                      <Link
                        key={c.key}
                        to={`/report?${new URLSearchParams({ [c.key]: String(c.value) })}`}
                        title={`View all reports for ${c.label}: ${c.value}`}
                        className="rounded-full border border-slate-200 px-3.5 py-1.5 text-[13px] text-slate-500 transition hover:border-[#1A4FE0] hover:bg-[#EEF3FF]"
                      >
                        {c.label}<b className="ml-1 font-semibold text-slate-900">{c.value}</b> ›
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {/* specs */}
              <p className={LABEL}>Specifications</p>
              <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
                {specs.map((s) => (
                  <div key={s.label} className="border-b border-slate-200 py-3">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-500">{s.label}</p>
                    <p className="break-words text-[15px] font-semibold text-slate-900">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* actions */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button onClick={handleAddToCart} disabled={addingToCart || buyingNow}
                  className={`flex items-center justify-center gap-2 rounded-lg border-[1.5px] py-[15px] text-[15px] font-semibold transition disabled:opacity-60
                    ${cartAdded ? "border-green-500 bg-green-50 text-green-600"
                                : "border-[#1A4FE0] bg-white text-[#1A4FE0] hover:bg-[#EEF3FF]"}`}>
                  {addingToCart ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Adding…</>)
                   : cartAdded ? (<><Ico n="check" className="h-[18px] w-[18px]" /> Added to cart</>)
                   : (<><Ico n="cart" className="h-[18px] w-[18px]" /> Add to cart</>)}
                </button>
                <button onClick={handleBuyNow} disabled={addingToCart || buyingNow}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#1A4FE0] py-[15px] text-[15px] font-semibold text-white transition hover:bg-[#123BB0] disabled:opacity-60">
                  {buyingNow ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Redirecting…</>)
                   : (<><Ico n="bolt" fill className="h-[18px] w-[18px]" /> Buy now</>)}
                </button>
              </div>

              {hasSample && (
                <button onClick={() => setSampleOpen(true)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-[#9DB6F2] bg-[#F8FAFF] px-3 py-[13px] text-[14.5px] font-semibold text-[#1A4FE0] transition hover:border-[#1A4FE0]">
                  <Ico n="file" className="h-[18px] w-[18px]" />
                  Download free preview (PDF)
                  <span className="font-medium text-slate-500">· {product.pdf_sample.size ? fmtSize(product.pdf_sample.size) : "summary pages + one sample project"}</span>
                </button>
              )}

              <p className="mt-3 text-center text-[12.5px] text-slate-500">
                🔒 Secure payment · Download immediately after payment · GST invoice provided
              </p>
            </div>
          </div>

          {/* ───────── tabs (full width) ───────── */}
          <div className="mt-8 overflow-hidden rounded-[14px] border border-slate-200 bg-white">
            <div className="flex gap-7 overflow-x-auto border-b border-slate-200 px-6 md:px-[30px]">
              {visibleTabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`-mb-px whitespace-nowrap border-b-2 pb-3.5 pt-[18px] text-[14.5px] font-semibold transition
                    ${tab === t.key ? "border-[#1A4FE0] text-[#1A4FE0]" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-6 text-[15px] leading-[1.85] text-slate-600 md:p-[30px]">
              {product[tab]?.trim()
                ? <RichText text={product[tab]} />
                : <p>Intelligence data and project leads tailored for industrial development.</p>}
            </div>
          </div>

          {product.highlights && (
            <div className="mt-6 rounded-[14px] border border-slate-200 bg-white p-6 md:p-[30px]">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1A4FE0]">Core highlights</p>
              <div className="whitespace-pre-line rounded-r-xl border border-l-4 border-blue-100 border-l-[#1A4FE0] bg-blue-50/50 px-5 py-4 text-sm leading-7 text-slate-700">
                {product.highlights}
              </div>
            </div>
          )}
        </Wrap>

        {/* ───────── what you can do ───────── */}
        <section className="mt-10 bg-[#F7F9FC] py-16">
          <Wrap>
            <SectionHead title="What you can do with this report" sub="Turn a list of projects into a sales pipeline for the next six months." />
            <div className="grid gap-5 md:grid-cols-3">
              {DO.map(([i, t, p]) => <WhoCard key={t} icon={i} title={t} text={p} />)}
            </div>
          </Wrap>
        </section>

        {/* ───────── sample page ───────── */}
        <section className="py-16">
          <Wrap className="text-center">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 md:text-3xl">
                See exactly what you get
              </h2>
              <p className="mb-6 mt-3 text-slate-600">
                Each project has its own page: basic details and location on the left, the project story and promoter contacts on the right. The free preview includes one full sample page.
              </p>

              {/* w-fit + mx-auto centres the list block; text-left keeps the ticks aligned */}
              <ul className="mx-auto mb-8 grid w-fit max-w-full gap-3 text-left">
                {INSIDE.map((t) => (
                  <li key={t} className="flex gap-3 text-[15px]">
                    <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-full bg-[#1A4FE0] text-xs font-bold text-white">✓</span>
                    {t}
                  </li>
                ))}
              </ul>

              {hasSample && (
                <button
                  onClick={() => setSampleOpen(true)}
                  className="rounded-lg bg-[#1A4FE0] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123BB0]"
                >
                  Download free preview
                </button>
              )}
            </div>
          </Wrap>
        </section>

        {/* ───────── related ───────── */}
        {related.length > 0 && (
          <section className="bg-[#F7F9FC] py-16">
            <Wrap>
              <div className="mb-7 flex flex-col gap-3 border-b border-slate-200 pb-[18px] sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">Related reports</h2>
                  <p className="mt-1 text-sm text-slate-500">Other editions{product.region ? ` for ${product.region} India` : ""} and the segments most active in this report.</p>
                </div>
                <Link to="/report" className="text-sm font-semibold text-[#1A4FE0] hover:underline">View all reports →</Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((p) => (
                  <ProductCard
                    key={p.id}
                    p={p}
                    inCart={cartItems.some((i) => i.product_id === p.id)}
                    adding={relAddingId === p.id}
                    onAdd={handleAddRelated}
                  />
                ))}
              </div>
            </Wrap>
          </section>
        )}

        <Upsell />

        <SampleRequestModal
          open={sampleOpen}
          onClose={() => setSampleOpen(false)}
          product={product}
          prefill={user}
        />
      </div>
    </>
  );
}