import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout, updateUser } from '../store/authSlice';
import axios from 'axios';
import { User, Lock, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import AccountNav from '../components/AccountNav'; // adjust path if needed
import useSeo from "../hooks/useSeo";
// ── helpers ──────────────────────────────────────────────────────────────────
const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;

const initialsOf = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase() || '?';

// 0 (empty) … 4 (strong)
const passwordScore = (pw) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.max(s, 1);
};
const STRENGTH = [
  null,
  { label: 'Weak', bar: 'bg-rose-500', text: 'text-rose-600' },
  { label: 'Fair', bar: 'bg-amber-500', text: 'text-amber-600' },
  { label: 'Good', bar: 'bg-blue-500', text: 'text-blue-600' },
  { label: 'Strong', bar: 'bg-emerald-500', text: 'text-emerald-600' },
];

// ── small components (kept OUTSIDE the page so inputs never lose focus) ──────
const FormInput = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, disabled = false, error, name, hint, autoComplete }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="w-full">
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        {Icon && <Icon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          id={name} name={name} disabled={disabled} placeholder={placeholder} autoComplete={autoComplete}
          type={isPassword && show ? 'text' : type}
          value={value || ''} onChange={onChange} aria-invalid={!!error}
          className={`w-full rounded-md border py-2.5 text-sm outline-none transition placeholder:text-slate-400
            ${Icon ? 'pl-10' : 'pl-3.5'} ${isPassword ? 'pr-11' : 'pr-3.5'}
            ${disabled
              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
              : error
                ? 'border-rose-400 bg-white text-slate-900 focus:ring-2 focus:ring-rose-100'
                : 'border-slate-300 bg-white text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'}`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:text-slate-700">
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error ? <p className="mt-1 text-xs font-medium text-rose-600">{error}</p> : hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
};

const Notice = ({ type, children }) => (
  <div role="status" className={`rounded-md border-l-4 px-4 py-3 text-sm font-medium ${type === 'success' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-rose-500 bg-rose-50 text-rose-800'}`}>
    {children}
  </div>
);

const SubmitButton = ({ loading, disabled, children, className = '' }) => (
  <button type="submit" disabled={loading || disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-md px-6 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
    {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
    {children}
  </button>
);

const Card = ({ title, text, children }) => (
  <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-8">
    <div className="mb-6 border-b border-slate-100 pb-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
    {children}
  </section>
);

// ── page ─────────────────────────────────────────────────────────────────────
const MyAccount = () => {
    useSeo({ title: "My Account", noindex: true });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'password' ? 'password' : 'profile'; // /myAccount?tab=password

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({ name: '', mobile_number: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileMsg, setProfileMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        setUser(res.data.user);
        dispatch(updateUser(res.data.user)); // keep header name in sync
        setFormData({ name: res.data.user.name || '', mobile_number: res.data.user.mobile_number || '' });
      } catch (err) {
        if (err.response?.status === 401) { dispatch(logout()); navigate('/login'); }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
    setProfileErrors((p) => ({ ...p, [name]: '' }));
    setProfileMsg(null);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((p) => ({ ...p, [name]: value }));
    setPasswordErrors((p) => ({ ...p, [name]: '' }));
    setPasswordMsg(null);
  };

  const profileDirty = !!user && (formData.name !== (user.name || '') || formData.mobile_number !== (user.mobile_number || ''));

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Enter your name';
    if (formData.mobile_number && !PHONE_RE.test(formData.mobile_number.trim())) errs.mobile_number = 'Enter a valid phone number';
    setProfileErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = { name: formData.name.trim(), mobile_number: formData.mobile_number.trim() };
    const token = localStorage.getItem('token');
    setSavingProfile(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/user/update`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setUser((u) => ({ ...u, ...payload }));
      setFormData(payload);
      dispatch(updateUser({ name: payload.name }));
      setProfileMsg({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Could not update your profile. Try again.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    const { current_password, new_password, confirm_password } = passwordData;
    const errs = {};
    if (!current_password) errs.current_password = 'Enter your current password';
    if (new_password.length < 8) errs.new_password = 'Use at least 8 characters';
    else if (new_password === current_password) errs.new_password = 'Choose a different password from the current one';
    if (confirm_password !== new_password) errs.confirm_password = 'Passwords do not match';
    setPasswordErrors(errs);
    if (Object.keys(errs).length) return;

    const token = localStorage.getItem('token');
    setSavingPassword(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/user/update`, { current_password, new_password }, { headers: { Authorization: `Bearer ${token}` } });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setPasswordMsg({ type: 'success', text: 'Password updated.' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Could not update your password. Try again.' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600/20 border-t-blue-600" role="status" aria-label="Loading" />
    </div>
  );

  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : null;
  const score = passwordScore(passwordData.new_password);
  const strength = STRENGTH[score];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
        {/* Page header with user summary */}
        <div className="mb-6 flex items-center gap-4 border-b border-slate-200 pb-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-700 text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-xl">
            {initialsOf(user?.name)}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{user?.name}</h1>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-500">
              <Mail size={14} className="shrink-0" /> <span className="truncate">{user?.email}</span>
            </p>
            {memberSince && <p className="mt-0.5 text-xs text-slate-400">Member since {memberSince}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-3"><AccountNav active={tab} /></aside>

          <div className="lg:col-span-9">
            {tab === 'profile' && (
              <Card title="Personal information" text="Update your account details.">
                <form onSubmit={handleUpdateProfile} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormInput label="Full name" name="name" icon={User} autoComplete="name"
                      value={formData.name} onChange={handleInputChange} error={profileErrors.name} />
                    <FormInput label="Phone number" name="mobile_number" icon={Phone} type="tel" autoComplete="tel"
                      placeholder="+91 98765 43210" value={formData.mobile_number} onChange={handleInputChange} error={profileErrors.mobile_number} />
                    <div className="md:col-span-2">
                      <FormInput label="Email address" name="email" icon={Mail} disabled value={user?.email}
                        hint="You sign in with this email, so it can't be changed here." />
                    </div>
                  </div>

                  {profileMsg && <Notice type={profileMsg.type}>{profileMsg.text}</Notice>}

                  <div className="flex flex-wrap items-center gap-3">
                    <SubmitButton loading={savingProfile} disabled={!profileDirty} className="bg-blue-700 hover:bg-slate-900">Save changes</SubmitButton>
                    {profileDirty && !savingProfile && (
                      <button type="button"
                        onClick={() => { setFormData({ name: user.name || '', mobile_number: user.mobile_number || '' }); setProfileErrors({}); setProfileMsg(null); }}
                        className="rounded-md px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">
                        Discard changes
                      </button>
                    )}
                  </div>
                </form>
              </Card>
            )}

            {tab === 'password' && (
              <Card title="Security" text="Choose a strong password that you don't use anywhere else.">
                <form onSubmit={handleUpdatePassword} noValidate className="max-w-xl space-y-5">
                  <FormInput label="Current password" name="current_password" type="password" icon={Lock} autoComplete="current-password"
                    value={passwordData.current_password} onChange={handlePasswordChange} error={passwordErrors.current_password} />

                  <div>
                    <FormInput label="New password" name="new_password" type="password" icon={Lock} autoComplete="new-password"
                      placeholder="At least 8 characters" value={passwordData.new_password} onChange={handlePasswordChange} error={passwordErrors.new_password} />
                    {passwordData.new_password && (
                      <div className="mt-2">
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= score ? strength.bar : 'bg-slate-200'}`} />)}
                        </div>
                        <p className={`mt-1 text-xs font-semibold ${strength.text}`}>{strength.label}</p>
                      </div>
                    )}
                  </div>

                  <FormInput label="Confirm new password" name="confirm_password" type="password" icon={Lock} autoComplete="new-password"
                    value={passwordData.confirm_password} onChange={handlePasswordChange} error={passwordErrors.confirm_password} />

                  {passwordMsg && <Notice type={passwordMsg.type}>{passwordMsg.text}</Notice>}

                  <SubmitButton loading={savingPassword} disabled={!passwordData.current_password || !passwordData.new_password}
                    className="w-full bg-blue-700 hover:bg-slate-900 sm:w-auto">
                    Update password
                  </SubmitButton>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;