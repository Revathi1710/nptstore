import React, { useEffect, useState } from "react";
import axios from "axios";

const EMPTY = { name: "", email: "", mobile: "", company: "" };

// Defined OUTSIDE the modal on purpose: a component created inside another
// remounts on every keystroke and the input would lose focus after each letter.
const Input = ({ label, name, type = "text", placeholder, autoComplete, value, error, onChange }) => (
  <div>
    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</label>
    <input
      name={name} type={type} value={value} onChange={onChange}
      placeholder={placeholder} autoComplete={autoComplete}
      className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition
        placeholder:text-slate-300 focus:ring-2
        ${error ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"}`}
    />
    {error && <p className="text-[11px] text-red-500 font-semibold mt-1">{error}</p>}
  </div>
);

export default function SampleRequestModal({ open, onClose, product, prefill }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [serverError, setServerError] = useState("");

  // reset every time the popup opens; prefill name/email for logged-in users
  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY, name: prefill?.name || "", email: prefill?.email || "" });
      setErrors({}); setSentTo(""); setServerError("");
    }
  }, [open, prefill]);

  // Esc to close + lock page scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !loading && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, loading, onClose]);

  if (!open) return null;

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your name";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!/^[0-9+\-\s()]{7,20}$/.test(form.mobile.trim())) e.mobile = "Enter a valid mobile number";
    if (!form.company.trim()) e.company = "Please enter your company name";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setServerError("");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/products/${product.id}/sample-request`,
        form,
        { headers: { Accept: "application/json" } }
      );
      setSentTo(form.email);
    } catch (err) {
      if (err.response?.status === 422) {
        const flat = {};
        Object.entries(err.response.data?.errors ?? {}).forEach(([k, m]) => { flat[k] = Array.isArray(m) ? m[0] : m; });
        setErrors(flat);
      } else if (err.response?.status === 429) {
        setServerError("Too many requests. Please wait a minute and try again.");
      } else {
        setServerError(err.response?.data?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !loading && onClose()} />

      <div role="dialog" aria-modal="true" aria-label="Download sample"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-5 text-white">
          <button onClick={onClose} disabled={loading} aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
          <p className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-blue-100">Free sample</p>
          <h3 className="text-lg font-extrabold leading-snug pr-8 mt-1 line-clamp-2">{product.name}</h3>
        </div>

        {sentTo ? (
          
         
<div className="px-6 py-10 text-center">
  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </div>
  <h4 className="text-lg font-extrabold text-slate-900">Sample on its way!</h4>
  <p className="text-sm text-slate-700 mt-2 leading-relaxed">
    We've emailed the sample PDF to<br />
    <span className="font-bold text-blue-600">{sentTo}</span>
  </p>
  
  {/* Updated helper text & clickable WhatsApp link */}
  <p className="text-xs font-medium text-slate-700 mt-4 leading-normal">
    Please wait for 5 minutes to get it by mail. If you don't get it, call / WhatsApp{' '}
    <a 
      href="https://wa.me/919171015659" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="font-bold text-slate-900 underline underline-offset-2 hover:text-emerald-600 transition-colors"
    >
      9171015659
    </a>{' '}
    to receive the sample report.
  </p>

  <button onClick={onClose} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3 rounded-xl transition-colors">
    Done
  </button>
</div>
        ) : (
          /* form */
          <form onSubmit={submit} noValidate className="px-6 py-6 space-y-4">
            <p className="text-sm text-slate-500">Enter your details and we'll email the sample PDF to you instantly.</p>

            <Input label="Full name" name="name" placeholder="John Doe" autoComplete="name" value={form.name} error={errors.name} onChange={change} />
            <Input label="Email" name="email" type="email" placeholder="john@company.com" autoComplete="email" value={form.email} error={errors.email} onChange={change} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Mobile" name="mobile" type="tel" placeholder="98765 43210" autoComplete="tel" value={form.mobile} error={errors.mobile} onChange={change} />
              <Input label="Company" name="company" placeholder="Company name" autoComplete="organization" value={form.company} error={errors.company} onChange={change} />
            </div>

            {serverError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{serverError}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg shadow-blue-200">
              {loading ? (<><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>) : "Email me the sample"}
            </button>
            <p className="text-[11px] text-center text-slate-400">We'll only use your details to send this sample and related updates.</p>
          </form>
        )}
      </div>
    </div>
  );
}