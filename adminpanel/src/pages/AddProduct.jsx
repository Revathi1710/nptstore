import axios from "axios";
import { useState, useRef } from "react";
import React from "react";
import Sidebar from "../component/Sidebar";
import { STATES, REGIONS, SEGMENTS, INDUSTRIES } from "../constants/productOptions";
import { useNavigate } from "react-router-dom";
// ── Icons ─────────────────────────────────────────────────────────────────────
const Bold      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>;
const Italic    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>;
const Link2     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const ImageIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const ListUl    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><line x1="4" y1="6" x2="4.01" y2="6"/><line x1="4" y1="12" x2="4.01" y2="12"/><line x1="4" y1="18" x2="4.01" y2="18"/></svg>;
const ListOl    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>;
const QuoteIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>;
const UndoIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>;
const RedoIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>;
const UploadIcon= () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const CloseIcon = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const SlugIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const ExcelIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18" />
    <path d="M12 12l3 3M15 12l-3 3" strokeWidth="1.5" />
  </svg>
);
const PdfIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M8 15h1.5a1.5 1.5 0 0 0 0-3H8v5M13 17v-5h1.2a2.5 2.5 0 0 1 0 5H13" strokeWidth="1.3" />
  </svg>
);
const Spinner   = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────
// Spaces, underscores and hyphens all collapse into a single "-".
const generateSlug = (text) =>
  text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DEFAULT_QUANTITY = 200000;

// ── Axios ──────────────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  headers: { Accept: "application/json" },
});

// ── Rich Toolbar ───────────────────────────────────────────────────────────────
const RichToolbar = ({ taRef }) => {
  const wrap = (before, after) => {
    const el = taRef.current;
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const sel = el.value.substring(s, e);
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    setter.call(el, el.value.substring(0, s) + before + sel + (after ?? before) + el.value.substring(e));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus();
    el.setSelectionRange(s + before.length, e + before.length);
  };
  const btn = (icon, title, action) => (
    <button key={title} type="button" title={title} onClick={action}
      className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all flex items-center"
    >{icon}</button>
  );
  const sep = k => <div key={k} className="w-px h-4 bg-gray-300 mx-1" />;
  return (
    <div className="flex items-center gap-0.5 px-2.5 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
      {btn(<UndoIcon />, "Undo", () => document.execCommand("undo"))}
      {btn(<RedoIcon />, "Redo", () => document.execCommand("redo"))}
      {sep("s1")}
      <select className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-700 bg-white cursor-pointer outline-none">
        <option>Paragraph</option><option>Heading 1</option><option>Heading 2</option><option>Heading 3</option>
      </select>
      {sep("s2")}
      {btn(<Bold />,      "Bold",        () => wrap("**"))}
      {btn(<Italic />,    "Italic",      () => wrap("_"))}
      {sep("s3")}
      {btn(<Link2 />,     "Link",        () => wrap("[", "](url)"))}
      {btn(<ImageIcon />, "Image",       () => wrap("![alt](", ")"))}
      {sep("s4")}
      {btn(<QuoteIcon />, "Blockquote",  () => wrap("> ", ""))}
      {btn(<ListUl />,    "Bullet List", () => wrap("• ", ""))}
      {btn(<ListOl />,    "Numbered",    () => wrap("1. ", ""))}
    </div>
  );
};

// ── Rich Textarea ──────────────────────────────────────────────────────────────
const RichArea = ({ value, onChange, placeholder, minH = 170 }) => {
  const ref = useRef(null);
  const [focused, setFocused] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${focused ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]" : "border-gray-200"}`}>
      <RichToolbar taRef={ref} />
      <textarea ref={ref} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ minHeight: minH, fontFamily: "Georgia, serif", resize: "vertical" }}
        className="w-full px-4 py-3.5 border-none outline-none text-sm leading-relaxed text-gray-700 bg-white"
      />
    </div>
  );
};

// ── Field ──────────────────────────────────────────────────────────────────────
const Field = ({ label, error, hint, children }) => (
  <div>
    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">{label}</label>
    {children}
    {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
  </div>
);

// ── TextInput ──────────────────────────────────────────────────────────────────
const TextInput = ({ value, onChange, placeholder, type = "text", prefix, error, readOnly }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-3 text-sm text-gray-400 font-semibold pointer-events-none z-10">{prefix}</span>}
      <input type={type} value={value}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder} readOnly={readOnly}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className={`w-full rounded-lg text-sm outline-none transition-all duration-200 border
          ${prefix ? "pl-6 pr-3 py-2.5" : "px-3 py-2.5"}
          ${readOnly ? "bg-gray-100 text-gray-400 cursor-default" : "bg-gray-50 text-gray-800"}
          ${error ? "border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
            : focused ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
            : "border-gray-200 hover:border-gray-300"}`}
      />
    </div>
  );
};

// ── SelectInput (optional dropdown) ────────────────────────────────────────────
const SelectInput = ({ value, onChange, options, placeholder = "Select…", error }) => {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value ?? ""}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      className={`w-full rounded-lg text-sm outline-none transition-all duration-200 border px-3 py-2.5 bg-gray-50 cursor-pointer
        ${value ? "text-gray-800" : "text-gray-400"}
        ${error ? "border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
          : focused ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
          : "border-gray-200 hover:border-gray-300"}`}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
};

// ── Slug Input ─────────────────────────────────────────────────────────────────
const SlugInput = ({ value, onChange, error }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className={`flex items-center rounded-lg border overflow-hidden transition-all duration-200 bg-gray-50
      ${error ? "border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
        : focused ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
        : "border-gray-200"}`}>
      <div className="flex items-center gap-1.5 px-3 bg-gray-100 border-r border-gray-200 self-stretch">
        <SlugIcon />
        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">slug/</span>
      </div>
      <input value={value}
        onChange={e => onChange(
          e.target.value
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "")
            .replace(/-{2,}/g, "-")
        )}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder="auto-generated-from-name"
        className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-800"
        style={{ fontFamily: "monospace" }}
      />
      {value && (
        <span className="mr-2 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-600 font-semibold whitespace-nowrap">
          ✓ ready
        </span>
      )}
    </div>
  );
};

// ── Card ───────────────────────────────────────────────────────────────────────
const Card = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-5">{title}</p>
    {children}
  </div>
);

// ── Toast ──────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }) => {
  if (!msg) return null;
  return (
    <div style={{ animation: "slideUp 0.3s ease" }}
      className={`fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-xl
        ${type === "success" ? "bg-green-500" : "bg-red-500"}`}>
      {msg}
    </div>
  );
};

// ── Description Tabs ───────────────────────────────────────────────────────────
const DESC_TABS = [
  { key: "description_overview",      label: "Overview",              placeholder: "Write a high-level overview of this product…" },
  { key: "description_top_companies", label: "Top Companies Covered", placeholder: "• Company A\n• Company B\n• Company C" },
  { key: "description_whats_inside",  label: "What's Inside",         placeholder: "Describe the report contents, sections and data fields…" },
  { key: "description_faq",           label: "FAQ",                   placeholder: "Q: What is included?\nA: …" },
];

const DescriptionTabs = ({ form, set, errors }) => {
  const [active, setActive] = useState(DESC_TABS[0].key);
  const tab = DESC_TABS.find(t => t.key === active);

  return (
    <Card title="Description">
      <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
        {DESC_TABS.map((t, i) => {
          const isActive = t.key === active;
          const filled = !!form[t.key]?.trim();
          return (
            <button key={t.key} type="button" onClick={() => setActive(t.key)}
              className={`relative px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors -mb-px border-b-2
                ${isActive ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
              <span className="text-gray-300 mr-1.5">{i + 1}</span>{t.label}
              {errors[t.key] && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-red-500" />}
              {!errors[t.key] && filled && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-green-500" />}
            </button>
          );
        })}
      </div>

      <RichArea
        key={tab.key}
        value={form[tab.key]}
        onChange={set(tab.key)}
        placeholder={tab.placeholder}
        minH={220}
      />
      {errors[tab.key] && <p className="text-[11px] text-red-500 mt-1.5">{errors[tab.key]}</p>}
    </Card>
  );
};

// ── Excel Upload Card ──────────────────────────────────────────────────────────
const ExcelUploadCard = ({ excelFile, onFileSelect, onRemove, error, dragActive, onDragEnter, onDragLeave, onDrop }) => {
  const fileRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = "";
  };

  const getExtBadge = (name) => {
    const ext = name.split(".").pop().toUpperCase();
    const colors = { XLSX: "bg-green-100 text-green-700", XLS: "bg-green-100 text-green-700", CSV: "bg-blue-100 text-blue-700" };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[ext] ?? "bg-gray-100 text-gray-600"}`}>
        {ext}
      </span>
    );
  };

  return (
    <Card title="Excel / Data File">
      {!excelFile ? (
        <div
          onDragEnter={onDragEnter}
          onDragOver={e => e.preventDefault()}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all
            ${dragActive
              ? "border-green-400 bg-green-50 scale-[1.01]"
              : "border-green-200 bg-green-50/40 hover:bg-green-50 hover:border-green-400"
            }`}
        >
          <div className="flex justify-center text-green-400 mb-3"><ExcelIcon /></div>
          <p className="text-sm font-semibold text-green-600">
            {dragActive ? "Drop file here…" : "Click or drag & drop"}
          </p>
          <p className="text-xs text-gray-400 mt-1">.xlsx · .xls · .csv &nbsp;·&nbsp; max 20 MB</p>
        </div>
      ) : (
        <div className="border border-green-200 rounded-xl p-4 bg-green-50/60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <ExcelIcon />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-800 truncate max-w-[160px]">{excelFile.name}</p>
                {getExtBadge(excelFile.name)}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(excelFile.size)}</p>
            </div>
            <button type="button" onClick={onRemove} title="Remove file"
              className="w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors shrink-0">
              <CloseIcon />
            </button>
          </div>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="mt-3 w-full text-xs py-1.5 rounded-lg border border-dashed border-green-300 text-green-600 bg-white hover:bg-green-50 transition-colors font-medium">
            ↺ Replace file
          </button>
        </div>
      )}

      <input ref={fileRef} type="file"
        accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        className="hidden" onChange={handleChange} />

      {error && <p className="text-[11px] text-red-500 mt-2">{error}</p>}

      <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
        Upload the product's associated Excel/CSV data file. It will be stored securely and available for download.
      </p>
    </Card>
  );
};

// ── PDF Upload Card (reused for Full + Sample) ─────────────────────────────────
const PdfUploadCard = ({ title, file, onSelect, onRemove, error, maxMB, tip }) => {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  const pick = (f) => f && onSelect(f);

  return (
    <Card title={title}>
      {!file ? (
        <div
          onClick={() => ref.current?.click()}
          onDragEnter={() => setDrag(true)}
          onDragOver={e => e.preventDefault()}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
            ${drag ? "border-red-400 bg-red-50 scale-[1.01]" : "border-red-200 bg-red-50/40 hover:bg-red-50 hover:border-red-400"}`}>
          <div className="flex justify-center text-red-400 mb-2.5"><PdfIcon /></div>
          <p className="text-sm font-semibold text-red-500">{drag ? "Drop PDF here…" : "Click or drag & drop"}</p>
          <p className="text-xs text-gray-400 mt-1">.pdf · max {maxMB} MB</p>
        </div>
      ) : (
        <div className="border border-red-200 rounded-xl p-4 bg-red-50/60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-500 shrink-0"><PdfIcon /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(file.size)}</p>
            </div>
            <button type="button" onClick={onRemove} title="Remove file"
              className="w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors shrink-0">
              <CloseIcon />
            </button>
          </div>
          <button type="button" onClick={() => ref.current?.click()}
            className="mt-3 w-full text-xs py-1.5 rounded-lg border border-dashed border-red-300 text-red-500 bg-white hover:bg-red-50 transition-colors font-medium">
            ↺ Replace file
          </button>
        </div>
      )}
      <input ref={ref} type="file" accept=".pdf,application/pdf" className="hidden"
        onChange={e => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      {error && <p className="text-[11px] text-red-500 mt-2">{error}</p>}
      {tip && <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">{tip}</p>}
    </Card>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AddProduct() {
  const navigate = useNavigate();
  const initialForm = {
    name: "", slug: "", code: "", published_in: "", format: "",
    total_projects: "",
    state: "", region: "", segment: "", industry: "", year: "",   // optional classification
    description_overview: "", description_top_companies: "",
    description_whats_inside: "", description_faq: "",
    status: "active", price: "",
    quantity: DEFAULT_QUANTITY,   // hidden field, always sent
  };

  const [form,       setForm]       = useState(initialForm);
  const [images,     setImages]     = useState([]);
  const [excelFile,  setExcelFile]  = useState(null);
  const [pdfFull,    setPdfFull]    = useState(null);
  const [pdfSample,  setPdfSample]  = useState(null);
  const [errors,     setErrors]     = useState({});
  const [loading,    setLoading]    = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);
  const [toast,      setToast]      = useState({ msg: "", type: "success" });
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleNameChange = (val) => {
    setForm(f => ({ ...f, name: val, slug: slugLocked ? f.slug : generateSlug(val) }));
  };
  const handleSlugChange = (val) => {
    setSlugLocked(true);
    setForm(f => ({ ...f, slug: val }));
  };
  const resetSlug = () => {
    setSlugLocked(false);
    setForm(f => ({ ...f, slug: generateSlug(f.name) }));
  };

  const flash = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const resetAll = () => {
    setForm(initialForm);
    setImages([]);
    setExcelFile(null);
    setPdfFull(null);
    setPdfSample(null);
    setErrors({});
    setSlugLocked(false);
  };

  const addFiles = e => {
    Array.from(e.target.files).forEach(file =>
      setImages(prev => [...prev, { file, preview: URL.createObjectURL(file) }])
    );
    e.target.value = "";
  };

  const removeImage = idx => {
    setImages(prev => { URL.revokeObjectURL(prev[idx].preview); return prev.filter((_, i) => i !== idx); });
  };

  // ── Excel handlers ─────────────────────────────────────────────────────────
  const EXCEL_EXTENSIONS = [".xlsx", ".xls", ".csv"];
  const isValidExcel = (file) => {
    const name = file.name.toLowerCase();
    return EXCEL_EXTENSIONS.some(ext => name.endsWith(ext));
  };

  const handleExcelSelect = (file) => {
    if (!isValidExcel(file)) {
      flash("Only .xlsx, .xls, or .csv files are allowed.", "error");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      flash("Excel file must be under 20 MB.", "error");
      return;
    }
    setExcelFile(file);
    setErrors(prev => ({ ...prev, excel_file: null }));
  };

  const handleExcelDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleExcelSelect(file);
  };

  // ── PDF handler ────────────────────────────────────────────────────────────
  const handlePdfSelect = (setter, errKey, maxMB) => (file) => {
    const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
    if (!isPdf) return flash("Only PDF files are allowed.", "error");
    if (file.size > maxMB * 1024 * 1024) return flash(`PDF must be under ${maxMB} MB.`, "error");
    setter(file);
    setErrors(prev => ({ ...prev, [errKey]: null }));
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const save = async () => {
    setErrors({});
    setLoading(true);
    try {
      const fd = new FormData();
      // empty optional fields (including state/segment/industry) are simply not sent
      Object.entries(form).forEach(([k, v]) => { if (v !== "" && v != null) fd.append(k, v); });
      images.forEach(({ file }) => fd.append("images[]", file));

      if (excelFile) fd.append("excel_file", excelFile);
      if (pdfFull)   fd.append("pdf_full", pdfFull);
      if (pdfSample) fd.append("pdf_sample", pdfSample);

      const { data } = await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
      flash(`✓ "${data.data.name}" saved successfully!`);
      resetAll();
      setTimeout(() => {
        navigate("/allProduct"); // Update this path to match your route for All Products (e.g., "/products" or "/all-products")
      }, 1200);
    } catch (err) {
      if (err.response?.status === 422) {
        const flat = {};
        Object.entries(err.response.data?.errors ?? {}).forEach(([k, msgs]) => { flat[k] = Array.isArray(msgs) ? msgs[0] : msgs; });
        setErrors(flat);
        flash("Please fix the highlighted fields.", "error");
      } else {
        flash(err.response?.data?.message ?? "Server error. Please try again.", "error");
      }
    } finally { setLoading(false); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 font-sans">
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      <Toast msg={toast.msg} type={toast.type} />

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        <header className="bg-white border-b border-gray-200 px-7 h-14 flex items-center justify-between shrink-0">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-gray-700 font-medium">Dashboard</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium">Products</span>
            <span className="text-gray-300">/</span>
            <span className="text-blue-600 font-semibold">Add New</span>
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto px-7 py-7">
          <div className="max-w-[1260px] mx-auto">

            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-sm text-gray-400 mt-1">Create a new product listing for your store</p>
              </div>
              <div className="flex gap-2.5">
                <button type="button" onClick={resetAll}
                  className="text-sm px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={save} disabled={loading}
                  className={`text-sm px-5 py-2 rounded-lg font-semibold text-white flex items-center gap-2 transition-opacity
                    bg-gradient-to-r from-blue-500 to-blue-700 shadow-md shadow-blue-200
                    ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}>
                  {loading && <Spinner />}
                  {loading ? "Saving…" : "Save Product"}
                </button>
              </div>
            </div>

            {/* Two-column grid */}
            <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 280px" }}>

              {/* ── LEFT ── */}
              <div className="flex flex-col gap-5">

                <Card title="Basic Information">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Field label="Product Name *" error={errors.name}>
                      <TextInput value={form.name} onChange={handleNameChange} placeholder="e.g. Andhra Pradesh Projects Tracker" error={errors.name} />
                    </Field>
                    <Field label="Product Code *" error={errors.code}>
                      <TextInput value={form.code} onChange={set("code")} placeholder="e.g. PRD-001" error={errors.code} />
                    </Field>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Slug / URL Key *</label>
                      {slugLocked && (
                        <button type="button" onClick={resetSlug}
                          className="text-[11px] text-blue-500 font-semibold hover:text-blue-700 transition-colors">
                          ↺ Re-sync from name
                        </button>
                      )}
                    </div>
                    <SlugInput value={form.slug} onChange={handleSlugChange} error={errors.slug} />
                    {errors.slug
                      ? <p className="text-[11px] text-red-500 mt-1">{errors.slug}</p>
                      : <p className="text-[11px] text-gray-400 mt-1">Auto-generated from product name. You can edit it manually.</p>
                    }
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Field label="Published In *" error={errors.published_in}>
                      <TextInput value={form.published_in} onChange={set("published_in")} placeholder="e.g. 2026" error={errors.published_in} />
                    </Field>
                    <Field label="Format" error={errors.format}>
                      <TextInput value={form.format} onChange={set("format")} placeholder="e.g. Digital" error={errors.format} />
                    </Field>
                  </div>

                  <Field label="Total Number of Projects" error={errors.total_projects}>
                    <TextInput value={form.total_projects} onChange={set("total_projects")} placeholder="e.g. 49 pages (111 projects)" error={errors.total_projects} />
                  </Field>
                </Card>

                {/* Optional classification dropdowns */}
                <Card title="Classification (optional)">
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="State" error={errors.state}>
                      <SelectInput value={form.state} onChange={set("state")} options={STATES}
                        placeholder="All states" error={errors.state} />
                    </Field>
                    <Field label="Region" error={errors.region}>
                      <SelectInput value={form.region} onChange={set("region")} options={REGIONS}
                        placeholder="All regions" error={errors.region} />
                    </Field>
                    <Field label="Segment" error={errors.segment}>
                      <SelectInput value={form.segment} onChange={set("segment")} options={SEGMENTS}
                        placeholder="All segments" error={errors.segment} />
                    </Field>
                    <Field label="Industry" error={errors.industry}>
                      <SelectInput value={form.industry} onChange={set("industry")} options={INDUSTRIES}
                        placeholder="All industries" error={errors.industry} />
                    </Field>
                    <Field label="Year" error={errors.year}>
                      <TextInput value={form.year} onChange={set("year")} type="number"
                        placeholder="e.g. 2026" error={errors.year} />
                    </Field>
                  </div>
                </Card>

                {/* 4 description tabs */}
                <DescriptionTabs form={form} set={set} errors={errors} />

              </div>

              {/* ── RIGHT ── */}
              <div className="flex flex-col gap-5">

                {/* Image upload */}
                <Card title="Product Image">
                  {images.length === 0 ? (
                    <div onClick={() => fileRef.current.click()}
                      className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center cursor-pointer bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 transition-all">
                      <div className="flex justify-center text-blue-300 mb-2.5"><UploadIcon /></div>
                      <p className="text-sm font-semibold text-blue-500">Click to upload</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG · up to 10 MB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {images.map((img, i) => (
                        <div key={i} className="relative rounded-lg overflow-hidden border border-gray-200">
                          <img src={img.preview} alt={img.file.name} className="w-full h-36 object-cover block" />
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white border-none cursor-pointer flex items-center justify-center hover:bg-black/70 transition-colors">
                            <CloseIcon />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1">
                            <p className="text-[10px] text-white truncate">{img.file.name}</p>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => fileRef.current.click()}
                        className="text-xs py-2 rounded-lg border-2 border-dashed border-blue-200 text-blue-500 bg-blue-50 cursor-pointer font-medium hover:bg-blue-100 transition-colors">
                        + Add Another Image
                      </button>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={addFiles} />
                  {errors["images.0"] && <p className="text-[11px] text-red-500 mt-1.5">{errors["images.0"]}</p>}
                </Card>

                {/* Excel upload */}
                <ExcelUploadCard
                  excelFile={excelFile}
                  onFileSelect={handleExcelSelect}
                  onRemove={() => setExcelFile(null)}
                  error={errors.excel_file}
                  dragActive={dragActive}
                  onDragEnter={() => setDragActive(true)}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleExcelDrop}
                />

                {/* PDF: full version */}
                <PdfUploadCard
                  title="PDF — Full Version"
                  file={pdfFull}
                  onSelect={handlePdfSelect(setPdfFull, "pdf_full", 50)}
                  onRemove={() => setPdfFull(null)}
                  error={errors.pdf_full}
                  maxMB={50}
                  tip="The complete report delivered to buyers after purchase."
                />

                {/* PDF: sample */}
                <PdfUploadCard
                  title="PDF — Sample"
                  file={pdfSample}
                  onSelect={handlePdfSelect(setPdfSample, "pdf_sample", 20)}
                  onRemove={() => setPdfSample(null)}
                  error={errors.pdf_sample}
                  maxMB={20}
                  tip="A free preview shown on the product page."
                />

                {/* Status */}
                <Card title="Product Status">
                  <div className="flex flex-col gap-2">
                    {[
                      { v: "active",   label: "Active (Visible)",  dot: "#22c55e" },
                      { v: "inactive", label: "Inactive (Hidden)", dot: "#94a3b8" },
                    ].map(opt => (
                      <div key={opt.v} onClick={() => set("status")(opt.v)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer border transition-all
                          ${form.status === opt.v ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100"}`}>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: opt.dot, boxShadow: form.status === opt.v ? `0 0 0 3px ${opt.dot}44` : "none" }} />
                        <span className={`text-sm flex-1 ${form.status === opt.v ? "font-semibold text-blue-700" : "text-gray-500"}`}>{opt.label}</span>
                        <div className={`w-4 h-4 rounded-full transition-all border-2 ${form.status === opt.v ? "border-blue-600 bg-blue-600 scale-110" : "border-gray-300"}`}
                          style={form.status === opt.v ? { boxShadow: "inset 0 0 0 2px white" } : {}} />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Pricing */}
                <Card title="Pricing & Stock">
                  <div className="flex flex-col gap-4">
                    <Field label="Price (₹) *" error={errors.price}>
                      <TextInput value={form.price} onChange={set("price")} placeholder="0.00" type="number" prefix="₹" error={errors.price} />
                    </Field>
                  </div>
                </Card>

                {/* Save */}
                <button type="button" onClick={save} disabled={loading}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity
                    bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg shadow-blue-200
                    ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}>
                  {loading && <Spinner />}
                  {loading ? "Saving…" : "Save Product"}
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}