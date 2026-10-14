import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

// Shared pieces for Login and Register.

export const AuthShell = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-slate-50 px-4 py-8 sm:py-12">
    <div className="w-full max-w-md">
      <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer}
      <p className="mt-6 text-center text-xs text-slate-500">
        By continuing you agree to our{" "}
        <Link to="/terms" className="font-medium text-blue-700 hover:underline">Terms</Link> and{" "}
        <Link to="/privacy" className="font-medium text-blue-700 hover:underline">Privacy policy</Link>.
      </p>
    </div>
  </div>
);

export const Alert = ({ type = "error", children }) => {
  const styles = {
    error: "border-rose-500 bg-rose-50 text-rose-800",
    success: "border-emerald-500 bg-emerald-50 text-emerald-800",
    info: "border-blue-600 bg-blue-50 text-blue-800",
  };
  return (
    <div role={type === "error" ? "alert" : "status"} className={`mb-5 rounded-md border-l-4 px-4 py-3 text-sm font-medium ${styles[type]}`}>
      {children}
    </div>
  );
};

export const AuthField = ({ label, icon: Icon, type = "text", action, id, ...rest }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
        {action}
      </div>
      <div className="relative">
        {Icon && <Icon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          id={id}
          type={isPassword && show ? "text" : type}
          className={`w-full rounded-md border border-slate-300 bg-white py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${Icon ? "pl-10" : "pl-3.5"} ${isPassword ? "pr-11" : "pr-3.5"}`}
          {...rest}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:text-slate-700">
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
    </div>
  );
};

export const PrimaryButton = ({ loading, loadingText, children, ...rest }) => (
  <button
    disabled={loading}
    className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-60"
    {...rest}
  >
    {loading ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{loadingText}</>) : children}
  </button>
);