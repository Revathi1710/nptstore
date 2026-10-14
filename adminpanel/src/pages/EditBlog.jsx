import axios from "axios";
import { useState, useRef, useEffect } from "react";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../component/Sidebar";

// ── (All icon components are identical to AddBlog.jsx — copy them here) ────────
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
const PlusIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const Spinner   = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const generateSlug = (text) =>
  text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  headers: { Accept: "application/json" },
});

// ── Shared sub-components (same as AddBlog) ────────────────────────────────────
const RichToolbar = ({ taRef }) => {
  const wrap = (before, after) => {
    const el = taRef.current; if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const sel = el.value.substring(s, e);
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    setter.call(el, el.value.substring(0, s) + before + sel + (after ?? before) + el.value.substring(e));
    el.dispatchEvent(new Event("input", { bubbles: true })); el.focus();
    el.setSelectionRange(s + before.length, e + before.length);
  };
  const btn = (icon, title, action) => (
    <button key={title} type="button" title={title} onClick={action}
      className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all flex items-center">{icon}</button>
  );
  const sep = k => <div key={k} className="w-px h-4 bg-gray-300 mx-1" />;
  return (
    <div className="flex items-center gap-0.5 px-2.5 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
      {btn(<UndoIcon />, "Undo", () => document.execCommand("undo"))}
      {btn(<RedoIcon />, "Redo", () => document.execCommand("redo"))}{sep("s1")}
      <select className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-700 bg-white cursor-pointer outline-none">
        <option>Paragraph</option><option>Heading 1</option><option>Heading 2</option><option>Heading 3</option>
      </select>{sep("s2")}
      {btn(<Bold />, "Bold", () => wrap("**"))}{btn(<Italic />, "Italic", () => wrap("_"))}{sep("s3")}
      {btn(<Link2 />, "Link", () => wrap("[", "](url)"))}{btn(<ImageIcon />, "Image", () => wrap("![alt](", ")"))}{sep("s4")}
      {btn(<QuoteIcon />, "Blockquote", () => wrap("> ", ""))}{btn(<ListUl />, "Bullet List", () => wrap("• ", ""))}{btn(<ListOl />, "Numbered", () => wrap("1. ", ""))}
    </div>
  );
};
const RichArea = ({ value, onChange, placeholder, minH = 170 }) => {
  const ref = useRef(null); const [focused, setFocused] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${focused ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]" : "border-gray-200"}`}>
      <RichToolbar taRef={ref} />
      <textarea ref={ref} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ minHeight: minH, fontFamily: "Georgia, serif", resize: "vertical" }}
        className="w-full px-4 py-3.5 border-none outline-none text-sm leading-relaxed text-gray-700 bg-white" />
    </div>
  );
};
const Field = ({ label, error, hint, children }) => (
  <div>
    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 tracking-wider uppercase">{label}</label>
    {children}
    {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
  </div>
);
const TextInput = ({ value, onChange, placeholder, type = "text", error, readOnly }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} value={value} onChange={e => onChange && onChange(e.target.value)}
      placeholder={placeholder} readOnly={readOnly}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      className={`w-full rounded-lg text-sm outline-none transition-all duration-200 border px-3 py-2.5
        ${readOnly ? "bg-gray-100 text-gray-400 cursor-default" : "bg-gray-50 text-gray-800"}
        ${error ? "border-red-400" : focused ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]" : "border-gray-200 hover:border-gray-300"}`} />
  );
};
const SelectInput = ({ value, onChange, options, placeholder, error }) => {
  const [focused, setFocused] = useState(false);
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      className={`w-full rounded-lg text-sm outline-none transition-all duration-200 border px-3 py-2.5 bg-gray-50 text-gray-800 cursor-pointer
        ${error ? "border-red-400" : focused ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]" : "border-gray-200 hover:border-gray-300"}`}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
};
const SlugInput = ({ value, onChange, error }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className={`flex items-center rounded-lg border overflow-hidden transition-all duration-200 bg-gray-50
      ${error ? "border-red-400" : focused ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]" : "border-gray-200"}`}>
      <div className="flex items-center gap-1.5 px-3 bg-gray-100 border-r border-gray-200 self-stretch">
        <SlugIcon /><span className="text-xs text-gray-400 font-medium whitespace-nowrap">slug/</span>
      </div>
      <input value={value}
        onChange={e => onChange(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""))}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder="auto-generated-from-title"
        className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-800"
        style={{ fontFamily: "monospace" }} />
      {value && <span className="mr-2 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-600 font-semibold whitespace-nowrap">✓ ready</span>}
    </div>
  );
};
const Card = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-5">{title}</p>
    {children}
  </div>
);
const Toast = ({ msg, type }) => {
  if (!msg) return null;
  return (
    <div style={{ animation: "slideUp 0.3s ease" }}
      className={`fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-xl
        ${type === "success" ? "bg-green-500" : "bg-red-500"}`}>{msg}</div>
  );
};
const ProjectRow = ({ index, item, onChange, onRemove }) => (
  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/60 flex flex-col gap-3">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Project {index + 1}</span>
      <button type="button" onClick={onRemove} className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors"><CloseIcon /></button>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div><label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Project Promoter</label><TextInput value={item.promoter} onChange={v => onChange("promoter", v)} placeholder="e.g. Shri. Sanjay Gupta" /></div>
      <div><label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Products & Capacity</label><TextInput value={item.products_capacity} onChange={v => onChange("products_capacity", v)} placeholder="e.g. Grain based Ethanol (60 KLPD)" /></div>
      <div><label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Project Location</label><TextInput value={item.location} onChange={v => onChange("location", v)} placeholder="e.g. Village- Biladi, Raipur" /></div>
      <div><label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Proposed Investment</label><TextInput value={item.investment} onChange={v => onChange("investment", v)} placeholder="e.g. 864 (Rs.Million)" /></div>
      <div><label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Project Completion</label><TextInput value={item.completion} onChange={v => onChange("completion", v)} placeholder="e.g. June 2025" /></div>
    </div>
    <div>
      <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Executive Summary</label>
      <textarea value={item.summary} onChange={e => onChange("summary", e.target.value)} placeholder="Write the executive summary…" rows={3}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all resize-none"
        style={{ fontFamily: "Georgia, serif" }} />
    </div>
  </div>
);

// ── Main ───────────────────────────────────────────────────────────────────────
export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const emptyProject = () => ({ promoter: "", products_capacity: "", location: "", investment: "", completion: "", summary: "" });

  const [form,          setForm]          = useState({ title:"", slug:"", category:"", blog_type:"", status:"published", short_description:"", content:"", meta_title:"", meta_description:"", meta_keywords:"", author:"", published_at:"" });
  const [projects,      setProjects]      = useState([emptyProject()]);
  const [featuredImage, setFeaturedImage] = useState(null);   // new file
  const [imagePreview,  setImagePreview]  = useState(null);   // preview URL
  const [existingImage, setExistingImage] = useState(null);   // existing path from server
  const [errors,        setErrors]        = useState({});
  const [loading,       setLoading]       = useState(false);
  const [fetchLoading,  setFetchLoading]  = useState(true);
  const [slugLocked,    setSlugLocked]    = useState(true);
  const [toast,         setToast]         = useState({ msg: "", type: "success" });

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  // ── Load blog ──────────────────────────────────────────────────────────────
  useEffect(() => {
    api.get(`/blogs/${id}`)
      .then(({ data }) => {
        const b = data.data;
        setForm({
          title: b.title ?? "", slug: b.slug ?? "", category: b.category ?? "",
          blog_type: b.blog_type ?? "", status: b.status ?? "published",
          short_description: b.short_description ?? "", content: b.content ?? "",
          meta_title: b.meta_title ?? "", meta_description: b.meta_description ?? "",
          meta_keywords: b.meta_keywords ?? "", author: b.author ?? "",
          published_at: b.published_at ? b.published_at.substring(0, 10) : "",
        });
        setProjects(b.projects?.length ? b.projects : [emptyProject()]);
        if (b.featured_image) setExistingImage(b.featured_image);
      })
      .catch(() => flash("Failed to load blog.", "error"))
      .finally(() => setFetchLoading(false));
  }, [id]);

  const flash = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleTitleChange = (val) => {
    setForm(f => ({ ...f, title: val, slug: slugLocked ? f.slug : generateSlug(val) }));
  };
  const handleSlugChange = (val) => { setSlugLocked(true); setForm(f => ({ ...f, slug: val })); };
  const resetSlug = () => { setSlugLocked(false); setForm(f => ({ ...f, slug: generateSlug(f.title) })); };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { setFeaturedImage(file); setImagePreview(URL.createObjectURL(file)); }
    e.target.value = "";
  };
  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setFeaturedImage(null); setImagePreview(null); setExistingImage(null);
  };

  const addProject    = () => setProjects(p => [...p, emptyProject()]);
  const removeProject = (i) => setProjects(p => p.filter((_, idx) => idx !== i));
  const updateProject = (i, key, val) => setProjects(p => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));

  const save = async () => {
    setErrors({}); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('_method', 'PUT'); // Laravel method spoofing
      Object.entries(form).forEach(([k, v]) => { if (v !== "" && v != null) fd.append(k, v); });
      if (featuredImage) fd.append("featured_image", featuredImage);
      fd.append("projects", JSON.stringify(projects.filter(p => p.promoter || p.summary)));

      const { data } = await api.post(`/blogs/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      flash(`✓ "${data.data.title}" updated successfully!`);
      setTimeout(() => navigate('/blogs'), 1200);
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

  const CATEGORIES = [
    { value: "news", label: "News" },{ value: "state", label: "State Reports" },
    { value: "industry", label: "Industry Reports" },{ value: "region", label: "Region Reports" },
    { value: "infrastructure", label: "Infrastructure" },{ value: "energy", label: "Energy" },
    { value: "chemical", label: "Chemical" },{ value: "ports", label: "Ports & Shipping" },
  ];
  const BLOG_TYPES = [
    { value: "top_projects", label: "Top Projects" },{ value: "tracker", label: "Projects Tracker" },
    { value: "analysis", label: "Analysis" },{ value: "general", label: "General" },
  ];

  const currentImageUrl = imagePreview
    ?? (existingImage ? `${import.meta.env.VITE_SERVER_URL}/storage/${existingImage}` : null);

  if (fetchLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm gap-2">
          <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading blog...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 font-sans">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}`}</style>
      <Toast msg={toast.msg} type={toast.type} />
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-7 h-14 flex items-center justify-between shrink-0">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-gray-700 font-medium">Dashboard</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium">Blogs</span>
            <span className="text-gray-300">/</span>
            <span className="text-blue-600 font-semibold">Edit</span>
          </nav>
        </header>

        <div className="flex-1 overflow-y-auto px-7 py-7">
          <div className="max-w-[1260px] mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Blog</h1>
                <p className="text-sm text-gray-400 mt-1">Update your blog post</p>
              </div>
              <div className="flex gap-2.5">
                <button type="button" onClick={() => navigate('/blogs')}
                  className="text-sm px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                  ← Back
                </button>
                <button type="button" onClick={save} disabled={loading}
                  className={`text-sm px-5 py-2 rounded-lg font-semibold text-white flex items-center gap-2 transition-opacity bg-gradient-to-r from-blue-500 to-blue-700 shadow-md shadow-blue-200 ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}>
                  {loading && <Spinner />}{loading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 280px" }}>
              {/* LEFT */}
              <div className="flex flex-col gap-5">
                <Card title="Basic Information">
                  <div className="mb-4">
                    <Field label="Blog Title *" error={errors.title}>
                      <TextInput value={form.title} onChange={handleTitleChange} placeholder="Blog title…" error={errors.title} />
                    </Field>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Slug / URL Key *</label>
                      <button type="button" onClick={resetSlug} className="text-[11px] text-blue-500 font-semibold hover:text-blue-700 transition-colors">↺ Re-sync from title</button>
                    </div>
                    <SlugInput value={form.slug} onChange={handleSlugChange} error={errors.slug} />
                    {errors.slug ? <p className="text-[11px] text-red-500 mt-1">{errors.slug}</p> : <p className="text-[11px] text-gray-400 mt-1">Edit the slug carefully — changing it may break existing links.</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Category *" error={errors.category}>
                      <SelectInput value={form.category} onChange={set("category")} options={CATEGORIES} placeholder="Select category…" error={errors.category} />
                    </Field>
                    <Field label="Blog Type" error={errors.blog_type}>
                      <SelectInput value={form.blog_type} onChange={set("blog_type")} options={BLOG_TYPES} placeholder="Select type…" error={errors.blog_type} />
                    </Field>
                  </div>
                </Card>

                <Card title="Short Description">
                  <RichArea value={form.short_description} onChange={set("short_description")} placeholder="Short description for listing page…" minH={110} />
                  {errors.short_description && <p className="text-[11px] text-red-500 mt-1.5">{errors.short_description}</p>}
                </Card>

                <Card title="Project Details">
                  <p className="text-xs text-gray-400 mb-4">Add individual project entries</p>
                  <div className="flex flex-col gap-4">
                    {projects.map((proj, i) => (
                      <ProjectRow key={i} index={i} item={proj} onChange={(k, v) => updateProject(i, k, v)} onRemove={() => removeProject(i)} />
                    ))}
                  </div>
                  <button type="button" onClick={addProject}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-blue-200 text-blue-500 bg-blue-50 hover:bg-blue-100 text-sm font-semibold transition-colors">
                    <PlusIcon /> Add Another Project
                  </button>
                </Card>

                <Card title="Content Editor">
                  <RichArea value={form.content} onChange={set("content")} placeholder="Additional content / closing sections…" minH={160} />
                  {errors.content && <p className="text-[11px] text-red-500 mt-1.5">{errors.content}</p>}
                </Card>

                <Card title="SEO Settings">
                  <div className="flex flex-col gap-4">
                    <Field label="Meta Title" error={errors.meta_title} hint="Leave blank to auto-use blog title">
                      <TextInput value={form.meta_title} onChange={set("meta_title")} placeholder="SEO page title…" error={errors.meta_title} />
                    </Field>
                    <Field label="Meta Description" error={errors.meta_description} hint="Recommended: 150–160 characters">
                      <textarea value={form.meta_description} onChange={e => set("meta_description")(e.target.value)}
                        placeholder="Brief description for search engines…" rows={3}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 bg-gray-50 outline-none focus:border-blue-500 transition-all resize-none" />
                      <p className="text-[11px] text-gray-400 mt-1">{form.meta_description.length} / 160 chars</p>
                    </Field>
                    <Field label="Meta Keywords" error={errors.meta_keywords} hint="Comma-separated keywords">
                      <TextInput value={form.meta_keywords} onChange={set("meta_keywords")} placeholder="e.g. Chhattisgarh, projects, 2023" error={errors.meta_keywords} />
                    </Field>
                  </div>
                </Card>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col gap-5">
                <Card title="Featured Image">
                  {!currentImageUrl ? (
                    <div onClick={() => fileRef.current.click()}
                      className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center cursor-pointer bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 transition-all">
                      <div className="flex justify-center text-blue-300 mb-2.5"><UploadIcon /></div>
                      <p className="text-sm font-semibold text-blue-500">Click to upload</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG · up to 10 MB</p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200">
                      <img src={currentImageUrl} alt="Featured" className="w-full h-44 object-cover block" />
                      <button type="button" onClick={removeImage}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white border-none cursor-pointer flex items-center justify-center hover:bg-black/70 transition-colors">
                        <CloseIcon />
                      </button>
                      <button type="button" onClick={() => fileRef.current.click()}
                        className="w-full text-xs py-2 bg-white text-gray-500 font-medium hover:bg-gray-50 transition-colors border-t border-gray-200">
                        ↺ Replace Image
                      </button>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  {errors.featured_image && <p className="text-[11px] text-red-500 mt-1.5">{errors.featured_image}</p>}
                </Card>

                <Card title="Publish Status">
                  <div className="flex flex-col gap-2">
                    {[
                      { v: "published", label: "Published (Live)",  dot: "#22c55e" },
                      { v: "draft",     label: "Draft (Hidden)",     dot: "#f59e0b" },
                      { v: "inactive",  label: "Inactive (Hidden)",  dot: "#94a3b8" },
                    ].map(opt => (
                      <div key={opt.v} onClick={() => set("status")(opt.v)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer border transition-all ${form.status === opt.v ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100"}`}>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: opt.dot, boxShadow: form.status === opt.v ? `0 0 0 3px ${opt.dot}44` : "none" }} />
                        <span className={`text-sm flex-1 ${form.status === opt.v ? "font-semibold text-blue-700" : "text-gray-500"}`}>{opt.label}</span>
                        <div className={`w-4 h-4 rounded-full transition-all border-2 ${form.status === opt.v ? "border-blue-600 bg-blue-600 scale-110" : "border-gray-300"}`}
                          style={form.status === opt.v ? { boxShadow: "inset 0 0 0 2px white" } : {}} />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Publish Info">
                  <div className="flex flex-col gap-4">
                    <Field label="Published Date" error={errors.published_at}>
                      <TextInput value={form.published_at} onChange={set("published_at")} type="date" error={errors.published_at} />
                    </Field>
                    <Field label="Author Name" error={errors.author}>
                      <TextInput value={form.author} onChange={set("author")} placeholder="e.g. New Projects Tracker" error={errors.author} />
                    </Field>
                  </div>
                </Card>

                <button type="button" onClick={save} disabled={loading}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg shadow-blue-200 ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}>
                  {loading && <Spinner />}{loading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}