import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { User, Mail, Phone, Lock } from "lucide-react";
import axios from "axios";
import { mergeGuestCart } from "../store/cartSlice";
import { setCredentials } from "../store/authSlice";
import { AuthShell, Alert, AuthField, PrimaryButton } from "../components/Authparts"; // adjust path if needed

const RESEND_SECONDS = 30;

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Page the user was trying to reach before being sent to login/register
  const from = location.state?.from;
  const redirectTo = from && !["/login", "/register"].includes(from.split("?")[0]) ? from : "/";

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // counts down after an OTP is sent, so people don't spam "Resend"
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/register/send-otp`, {
        name,
        email,
        mobile_number: mobileNumber,
        password,
        password_confirmation: confirmPassword,
      });
      setStep(2);
      setSuccess(`We sent a code to ${email}.`);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.email?.[0] ||
          "We couldn't send the code. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    const otpValue = otp.join("");
    if (otpValue.length !== 6) { setError("Enter the full 6-digit code."); return; }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/register/verify-otp`, { email, otp: otpValue });
      const { token, user } = response.data;

      try {
        await dispatch(mergeGuestCart(token)).unwrap();
      } catch (mergeErr) {
        console.warn("Cart merge failed:", mergeErr);
      }

      // Header + ProtectedRoute update instantly (also refetches the cart)
      dispatch(setCredentials({ token, user }));

      setSuccess("Your account is ready. Taking you back…");
      setTimeout(() => navigate(redirectTo, { replace: true }), 800);
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
      await axios.post(`${import.meta.env.VITE_API_URL}/register/resend-otp`, { email });
      setSuccess("We sent you a new code.");
      setOtp(["", "", "", "", "", ""]);
      setCooldown(RESEND_SECONDS);
      document.getElementById("otp-0")?.focus();
    } catch {
      setError("We couldn't resend the code. Try again.");
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
      title={step === 1 ? "Create your account" : "Verify your email"}
      subtitle={step === 1 ? "Enter your details to get started." : `Enter the 6-digit code we sent to ${email}.`}
      footer={
        step === 1 && (
          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" state={location.state} className="font-semibold text-blue-700 hover:underline">Sign in</Link>
          </p>
        )
      }
    >
      {/* Step indicator */}
      <div className="-mt-1 mb-5" aria-label={`Step ${step} of 2`}>
        <div className="flex gap-1.5">
          <span className="h-1 flex-1 rounded-full bg-blue-700" />
          <span className={`h-1 flex-1 rounded-full ${step === 2 ? "bg-blue-700" : "bg-slate-200"}`} />
        </div>
        <p className="mt-2 text-xs font-medium text-slate-500">Step {step} of 2: {step === 1 ? "Your details" : "Verify with a code"}</p>
      </div>

      {error && <Alert>{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {step === 1 && (
        <form onSubmit={handleRegister} className="space-y-4">
          <AuthField id="reg-name" label="Full name" icon={User} value={name} required autoComplete="name"
            onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          <AuthField id="reg-email" label="Email address" icon={Mail} type="email" value={email} required autoComplete="email"
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <AuthField id="reg-mobile" label="Mobile number" icon={Phone} type="tel" value={mobileNumber} required autoComplete="tel"
            onChange={(e) => setMobileNumber(e.target.value)} placeholder="+91 98765 43210" />
          <AuthField id="reg-password" label="Password" icon={Lock} type="password" value={password} required autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          <AuthField id="reg-confirm" label="Confirm password" icon={Lock} type="password" value={confirmPassword} required autoComplete="new-password"
            onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" />

          <PrimaryButton type="submit" loading={loading} loadingText="Sending code">Send code</PrimaryButton>
        </form>
      )}

      {step === 2 && (
        <>
          <form onSubmit={handleVerifyOtp} className="space-y-6">
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
            <PrimaryButton type="submit" loading={loading} loadingText="Verifying">Verify and create account</PrimaryButton>
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

export default Register;