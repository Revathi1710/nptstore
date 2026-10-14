import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Mail } from "lucide-react";
import axios from "axios";
import { mergeGuestCart } from "../store/cartSlice";
import { setCredentials } from "../store/authSlice";
import { AuthShell, Alert, AuthField, PrimaryButton } from "../components/Authparts";
import useSeo from "../hooks/useSeo";
const RESEND_SECONDS = 30;
const API = import.meta.env.VITE_API_URL;

// One page for sign in AND sign up: enter email -> enter the code we email -> done.
// This is the ONLY place a token is issued, so order history / profile always need a verified email.
const Login = () => {
  useSeo({ title: "Sign In", description: "Sign in to NPT Store with your email. No password needed.", noindex: true });
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // The page the user was on before signing in (e.g. /checkout, /report, /my-orders).
  // Whoever links to /login passes it as: <Link to="/login" state={{ from: "/that/page" }} />
  // `from` may be a string or a router location object ({ pathname, search }).
  const rawFrom = location.state?.from;
  const from = typeof rawFrom === "string" ? rawFrom : rawFrom ? `${rawFrom.pathname || ""}${rawFrom.search || ""}` : "";
  // After login go back to that page; if we do not know it, go home.
  const redirectTo = from && !["/login", "/register"].includes(from.split("?")[0]) ? from : "/";

  const [step, setStep] = useState(1);
  // email can be prefilled (e.g. from the checkout success screen)
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API}/auth/send-code`, { email });
      setStep(2);
      setOtp(["", "", "", "", "", ""]);
      setSuccess(`We sent a code to ${email}.`);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || "We couldn't send the code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setError("");

    const otpValue = otp.join("");
    if (otpValue.length !== 6) { setError("Enter the full 6-digit code."); return; }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/verify-code`, { email, otp: otpValue });
      const { token, user } = data;

      // 1. Move the guest cart into the account (never block login if this fails)
      try {
        await dispatch(mergeGuestCart(token)).unwrap();
      } catch (mergeErr) {
        console.warn("Cart merge failed:", mergeErr);
      }

      // 2. Save credentials -> Header + ProtectedRoute update instantly
      dispatch(setCredentials({ token, user }));

      // 3. Back to the page they came from
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "That code is wrong or has expired. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResendLoading(true);
    try {
      await axios.post(`${API}/auth/send-code`, { email });
      setSuccess("We sent you a new code.");
      setOtp(["", "", "", "", "", ""]);
      setCooldown(RESEND_SECONDS);
      document.getElementById("otp-0")?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't resend the code. Try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) document.getElementById(`otp-${index - 1}`)?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      setOtp(pasted.split(""));
      document.getElementById("otp-5")?.focus();
    }
  };

  return (
    <AuthShell
      title={step === 1 ? "Sign in" : "Check your email"}
      subtitle={step === 1 ? "Sign in or create an account with just your email." : `Enter the 6-digit code we sent to ${email}.`}
    >
      {from && step === 1 && !error && <Alert type="info">Verify your email to continue.</Alert>}
      {error && <Alert>{error}</Alert>}
      {success && step === 2 && <Alert type="success">{success}</Alert>}

      {step === 1 && (
        <form onSubmit={sendCode} className="space-y-4">
          <AuthField id="login-email" label="Email address" icon={Mail} type="email" value={email} required autoFocus
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          <PrimaryButton type="submit" loading={loading} loadingText="Sending code">Continue</PrimaryButton>
          <p className="text-center text-xs text-slate-500">No password needed. We will email you a code.</p>
        </form>
      )}

      {step === 2 && (
        <>
          <form onSubmit={verifyCode} className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  autoFocus={i === 0}
                  maxLength={1}
                  value={digit}
                  aria-label={`Digit ${i + 1}`}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className="h-12 w-10 rounded-md border border-slate-300 bg-white text-center text-xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:h-14 sm:w-12"
                />
              ))}
            </div>
            <PrimaryButton type="submit" loading={loading} loadingText="Verifying">Verify and sign in</PrimaryButton>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <button type="button" onClick={() => { setStep(1); setError(""); setSuccess(""); }} className="font-medium text-slate-500 hover:text-slate-800">
              Change email
            </button>
            <button type="button" onClick={handleResend} disabled={resendLoading || cooldown > 0}
              className="font-semibold text-blue-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline">
              {resendLoading ? "Sending…" : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </>
      )}
    </AuthShell>
  );
};

export default Login;