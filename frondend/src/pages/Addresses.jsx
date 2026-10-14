import React, { useState, useEffect } from "react";
import axios from "axios";
import { COUNTRIES, INDIA_STATES } from "../data/locations";
import AccountNav from "../components/AccountNav"; // same side menu as My orders
import useSeo from "../hooks/useSeo";
const API = import.meta.env.VITE_API_URL;

const headers = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const EMPTY = {
  first_name: "",
  last_name: "",
  mobile: "",
  country: "India",
  state: "",
  city: "",
  pincode: "",
  address: "",
  is_default: false,
};

// kept outside the page component so inputs don't remount on every keystroke
const Input = ({ label, name, value, onChange, error, as, optional, span, children, ...rest }) => {
  const id = `ad-${name}`;
  const base = `w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
    error ? "border-rose-400 focus:ring-2 focus:ring-rose-100" : "border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
  }`;
  return (
    <div className={span ? "md:col-span-2" : ""}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {optional && <span className="font-normal text-slate-400">(optional)</span>}
      </label>
      {as === "select" ? (
        <select id={id} name={name} value={value} onChange={onChange} aria-invalid={!!error} className={`${base} cursor-pointer`} {...rest}>
          {children}
        </select>
      ) : (
        <input id={id} name={name} value={value} onChange={onChange} aria-invalid={!!error} className={base} {...rest} />
      )}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
};

export default function Addresses() {
  useSeo({ title: "My Addresses", noindex: true });
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [editingId, setEditingId] = useState(null); // null = closed, 'new' = adding, number = editing
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/addresses`, { headers: headers() });
      setList(data.data || []);
      setPageError("");
    } catch {
      setPageError("We could not load your addresses. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm({ ...EMPTY, is_default: list.length === 0 });
    setErrors({});
    setEditingId("new");
  };
  const openEdit = (a) => {
    setForm({
      first_name: a.first_name || "",
      last_name: a.last_name || "",
      mobile: a.mobile || "",
      country: a.country || "India",
      state: a.state || "",
      city: a.city || "",
      pincode: a.pincode || "",
      address: a.address || "",
      is_default: !!a.is_default,
    });
    setErrors({});
    setEditingId(a.id);
  };
  const close = () => {
    setEditingId(null);
    setErrors({});
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "country" ? { state: "" } : {}),
    }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "Enter a first name";
    if (!form.last_name.trim()) e.last_name = "Enter a last name";
    if (!form.mobile.trim()) e.mobile = "Enter a mobile number";
    if (!form.country) e.country = "Select a country";
    if (form.country === "India" && !form.state) e.state = "Select a state";
    if (!form.city.trim()) e.city = "Enter a city";
    if (!form.pincode.trim()) e.pincode = "Enter a pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingId === "new") {
        await axios.post(`${API}/addresses`, form, { headers: headers() });
      } else {
        await axios.put(`${API}/addresses/${editingId}`, form, { headers: headers() });
      }
      await load();
      close();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        setErrors(Object.fromEntries(Object.entries(apiErrors).map(([k, v]) => [k, v[0]])));
      } else {
        setErrors({ _form: err.response?.data?.message || "We could not save this address. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

  const makeDefault = async (id) => {
    try {
      await axios.post(`${API}/addresses/${id}/default`, {}, { headers: headers() });
      await load();
    } catch {
      setPageError("We could not change your default address. Please try again.");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await axios.delete(`${API}/addresses/${id}`, { headers: headers() });
      await load();
    } catch {
      setPageError("We could not delete this address. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My addresses</h1>
            <p className="mt-1 text-sm text-slate-500">Saved addresses are offered to you at checkout.</p>
          </div>
          {editingId === null && (
            <button onClick={openNew} className="rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900">
              Add address
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-3">
            <AccountNav active="address" />
          </aside>

          <div className="lg:col-span-9">
            {pageError && (
              <div role="alert" className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                {pageError}
              </div>
            )}

            {editingId !== null && (
              <form onSubmit={save} className="mb-6 rounded-lg border border-slate-200 bg-white p-5 sm:p-8">
                <h2 className="mb-4 text-lg font-bold text-slate-900">{editingId === "new" ? "Add a new address" : "Edit address"}</h2>

                <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                  <Input
                    label="First name"
                    name="first_name"
                    value={form.first_name}
                    onChange={onChange}
                    error={errors.first_name}
                    autoComplete="given-name"
                  />
                  <Input
                    label="Last name"
                    name="last_name"
                    value={form.last_name}
                    onChange={onChange}
                    error={errors.last_name}
                    autoComplete="family-name"
                  />
                  <Input
                    label="Mobile number"
                    name="mobile"
                    type="tel"
                    inputMode="tel"
                    value={form.mobile}
                    onChange={onChange}
                    error={errors.mobile}
                    autoComplete="tel"
                  />

                  <Input
                    label="Country"
                    name="country"
                    as="select"
                    value={form.country}
                    onChange={onChange}
                    error={errors.country}
                    autoComplete="country-name"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Input>

                  {form.country === "India" && (
                    <Input
                      label="State"
                      name="state"
                      as="select"
                      value={form.state}
                      onChange={onChange}
                      error={errors.state}
                      autoComplete="address-level1"
                    >
                      <option value="">Select state</option>
                      {INDIA_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Input>
                  )}

                  <Input label="City" name="city" value={form.city} onChange={onChange} error={errors.city} autoComplete="address-level2" />
                  <Input
                    label="Pincode"
                    name="pincode"
                    inputMode="numeric"
                    value={form.pincode}
                    onChange={onChange}
                    error={errors.pincode}
                    autoComplete="postal-code"
                  />
                  <Input
                    label="Address"
                    name="address"
                    span
                    optional
                    placeholder="House, street, area"
                    value={form.address}
                    onChange={onChange}
                    error={errors.address}
                    autoComplete="street-address"
                  />
                </div>

                <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={form.is_default}
                    onChange={onChange}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Use as my default address
                </label>

                {errors._form && <p className="mt-4 text-sm font-medium text-rose-600">{errors._form}</p>}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50"
                  >
                    {saving ? "Saving" : "Save address"}
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-md border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <p className="py-10 text-center text-sm text-slate-500">Loading your addresses…</p>
            ) : list.length === 0 && editingId === null ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <p className="text-sm text-slate-600">You have no saved addresses yet.</p>
                <p className="mt-1 text-sm text-slate-500">
                  Your address is saved automatically when you place an order, or you can add one now.
                </p>
                <button
                  onClick={openNew}
                  className="mt-4 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
                >
                  Add address
                </button>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {list.map((a) => (
                  <li key={a.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">
                        {a.first_name} {a.last_name}
                      </p>
                      {a.is_default && (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Default</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {[a.address, a.city, a.state, a.pincode, a.country].filter(Boolean).join(", ")}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{a.mobile}</p>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-sm font-semibold">
                      <button onClick={() => openEdit(a)} className="text-blue-700 hover:underline">
                        Edit
                      </button>
                      {!a.is_default && (
                        <button onClick={() => makeDefault(a.id)} className="text-blue-700 hover:underline">
                          Set as default
                        </button>
                      )}
                      <button onClick={() => remove(a.id)} className="text-rose-600 hover:underline">
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}