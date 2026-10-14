import React, { useState } from "react";
import axios from "axios";
import { FiLock, FiShield, FiCheckCircle, FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import Sidebar from "../component/Sidebar";

const ChangePassword = () => {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.new_password !== form.confirm_password) {
      return setError("New password and confirm password do not match");
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/change-password`,
        {
          old_password: form.old_password,
          new_password: form.new_password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(res.data.message || "Password updated successfully");
      setForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header Section */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Security Settings</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Account & System / Password</p>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Form Header */}
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                    <FiShield size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Update Password</h2>
                    <p className="text-sm text-slate-500">Ensure your account is using a long, random password to stay secure.</p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-8">
                {error && (
                  <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    <FiAlertCircle className="shrink-0" />
                    {error}
                  </div>
                )}
                
                {message && (
                  <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    <FiCheckCircle className="shrink-0" />
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        name="old_password"
                        placeholder="••••••••"
                        value={form.old_password}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                      <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="password"
                          name="new_password"
                          placeholder="New secret"
                          value={form.new_password}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                      <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="password"
                          name="confirm_password"
                          placeholder="Repeat new secret"
                          value={form.confirm_password}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Save New Password"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Quick Safety Tip Card */}
            <div className="mt-8 p-6 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
              <div className="text-amber-600 shrink-0">
                <FiAlertCircle size={20} />
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                <strong>Tip:</strong> Use at least 8 characters, with a mix of letters, numbers, and symbols. 
                Avoid using common words or information like your name or birthdate.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChangePassword;