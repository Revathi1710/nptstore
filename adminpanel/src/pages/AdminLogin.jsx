import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// Icons make the UI feel more "app-like"
import { Lock, User, Loader2, AlertCircle } from "lucide-react"; 

const AdminLogin = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/login`,
        credentials
      );

      const { token, admin } = response.data;
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_user", JSON.stringify(admin));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] selection:bg-blue-500/30">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md px-6">
        {/* Branding/Logo Area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mb-4 shadow-xl shadow-blue-500/20">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Admin Console
          </h1>
          <p className="text-slate-400 mt-2">Secure access for authorized personnel only</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleAdminLogin} className="space-y-5">
            
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm animate-shake">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="admin_id"
                  value={credentials.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          <footer className="mt-8 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
              Protected by Enterprise Shield
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;