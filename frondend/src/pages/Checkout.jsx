import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { selectCartItems, selectCartTotal, clearCartAsync } from '../store/cartSlice';
import { selectBuyNowProduct, clearBuyNow } from '../store/buyNowSlice';
import { selectUser, logout } from '../store/authSlice';
import axios from 'axios';
import useSeo from "../hooks/useSeo";
import { COUNTRIES, INDIA_STATES } from '../data/locations';

const API = import.meta.env.VITE_API_URL;
const inr = (n) => Math.round(Number(n) || 0).toLocaleString('en-IN');

// logged-in users send their token, guests send their cart session id
const authHeaders = () => {
  const token = localStorage.getItem('token');
  const sessionId = localStorage.getItem('cart_session_id');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : sessionId ? { 'X-Session-Id': sessionId } : {}),
  };
};

// ─── FIELD (must stay outside Checkout so inputs don't remount on every keystroke) ──
const Field = ({ label, name, type = 'text', placeholder, span, as, children, value, onChange, error, optional, ...rest }) => {
  const id = `co-${name}`;
  const base = `w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400
    ${error ? 'border-rose-400 focus:ring-2 focus:ring-rose-100' : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'}`;
  return (
    <div className={span ? 'md:col-span-2' : ''}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {optional && <span className="font-normal text-slate-400">(optional)</span>}
      </label>
      {as === 'select' ? (
        <select id={id} name={name} value={value} onChange={onChange} aria-invalid={!!error} className={`${base} cursor-pointer`} {...rest}>
          {children}
        </select>
      ) : (
        <input id={id} type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} aria-invalid={!!error} className={base} {...rest} />
      )}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Checkout() {
  useSeo({ title: "Checkout", noindex: true });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const user = useSelector(selectUser);
  const buyNowProduct = useSelector(selectBuyNowProduct);
  const cartItems = useSelector(selectCartItems);
  const cartSubtotal = useSelector(selectCartTotal);

  // Flow is decided by the URL (?flow=buynow), not by Redux alone, so a stale
  // buy-now product can never hijack a normal cart checkout.
  const isBuyNow = searchParams.get('flow') === 'buynow' && !!buyNowProduct;

  useEffect(() => {
    if (searchParams.get('flow') !== 'buynow') dispatch(clearBuyNow());
  }, [searchParams]);

  const orderItems = isBuyNow
    ? [{
        id: buyNowProduct.id,
        name: buyNowProduct.name,
        price: Number(buyNowProduct.active_price || buyNowProduct.price || 0),
        quantity: 1,
        image: buyNowProduct.image,
        code: buyNowProduct.code,
      }]
    : cartItems.map((item) => ({
        id: item.product?.id || item.product_id,
        name: item.product?.name || item.name,
        price: Number(item.product?.active_price || item.product?.price || item.active_price || item.price || 0),
        quantity: item.quantity,
        image: item.product?.images?.[0]?.path || item.image || null,
      }));

  const subtotal = isBuyNow ? (orderItems[0]?.price || 0) : cartSubtotal;
  const taxAmount = subtotal * 0.18;
  const finalTotal = subtotal + taxAmount;

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', mobile: '',
    country: 'India', state: '', city: '', pincode: '', address: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paidEmail, setPaidEmail] = useState('');
  const [wasGuest, setWasGuest] = useState(false);
  const busy = useRef(false);   // blocks double-clicks on "Pay"

  // Saved addresses (logged-in customers only)
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const addressAppliedRef = useRef(false);   // auto-apply the default only once

  // Contact section: sign out without leaving checkout
  const handleSignOut = async () => {
    try {
      if (localStorage.getItem('token')) await axios.post(`${API}/logout`, {}, { headers: authHeaders() });
    } catch { /* the token is dropped locally either way */ }
    dispatch(logout());
    setAddresses([]);
    setSelectedAddressId(null);
    addressAppliedRef.current = false;
    setFormData((p) => ({ ...p, firstName: '', lastName: '', email: '', mobile: '', state: '', city: '', pincode: '', address: '' }));
  };

  const applyAddress = (a) => {
    setFormData((p) => ({
      ...p,
      firstName: a.first_name || '',
      lastName: a.last_name || '',
      mobile: a.mobile || '',
      country: a.country || 'India',
      state: a.state || '',
      city: a.city || '',
      pincode: a.pincode || '',
      address: a.address || '',
    }));
    setSelectedAddressId(a.id);
    setErrors({});
  };

  const useNewAddress = () => {
    setFormData((p) => ({ ...p, country: 'India', state: '', city: '', pincode: '', address: '' }));
    setSelectedAddressId(null);
    document.getElementById('co-city')?.focus();
  };

  useEffect(() => {
    if (!user) { setAddresses([]); return; }
    let cancelled = false;
    axios
      .get(`${API}/addresses`, { headers: authHeaders() })
      .then(({ data }) => {
        if (cancelled) return;
        const list = data.data || [];
        setAddresses(list);
        if (list.length && !addressAppliedRef.current) {
          addressAppliedRef.current = true;
          applyAddress(list.find((a) => a.is_default) || list[0]);
        }
      })
      .catch(() => {});   // saved addresses are a convenience, never block checkout
    return () => { cancelled = true; };
  }, [user]);

  // Logged-in customers: fill their details automatically (they can still edit).
  // Guests: they just fill the form once, here. No register / OTP step during checkout.
  useEffect(() => {
    if (!user) return;
    const parts = (user.name || '').trim().split(/\s+/);
    const first = parts.shift() || '';
    const last = parts.join(' ');
    setFormData((p) => ({
      ...p,
      firstName: p.firstName || first,
      lastName: p.lastName || last,
      email: user.email || p.email || '',   // a signed-in customer's email is the account email
      mobile: p.mobile || user.mobile_number || '',
    }));
  }, [user]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'country' ? { state: '' } : {}),
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    // editing an address field means it is no longer exactly the saved one
    if (['firstName', 'lastName', 'mobile', 'country', 'state', 'city', 'pincode', 'address'].includes(name)) {
      setSelectedAddressId(null);
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'Enter your first name';
    if (!formData.lastName.trim()) e.lastName = 'Enter your last name';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email address';
    if (!formData.mobile.trim()) e.mobile = 'Enter your mobile number';
    if (!formData.country.trim()) e.country = 'Select your country';
    if (formData.country === 'India' && !formData.state) e.state = 'Select your state';
    if (!formData.city.trim()) e.city = 'Enter your city';
    if (!formData.pincode.trim()) e.pincode = 'Enter your pincode';
    setErrors(e);
    // Bring the first error into view (helps on phones)
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`co-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return Object.keys(e).length === 0;
  };

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const release = () => { busy.current = false; setLoading(false); };

  const finishSuccess = () => {
    if (isBuyNow) dispatch(clearBuyNow());
    else dispatch(clearCartAsync());
    // Guests stay guests: they were not signed in when they paid, so they must
    // verify their email with an OTP before they can see orders or profile.
    setWasGuest(!user);
    setPaidEmail(formData.email);
    setPaymentSuccess(true);
  };

  // tell the server the payment did not complete (window closed / card declined / SDK failed)
  const reportFailure = (razorpayOrderId, reason, paymentId) => {
    if (!razorpayOrderId) return;
    axios
      .post(`${API}/orders/fail`, { razorpay_order_id: razorpayOrderId, reason, razorpay_payment_id: paymentId }, { headers: authHeaders() })
      .catch(() => {});
  };

  // ── Click "Pay": 1) create the order  2) open Razorpay  3) verify / fail ────
  const handlePayment = async () => {
    if (busy.current) return;
    if (!validate()) return;
    setPayError('');

    if (Math.round(finalTotal) === 0 && !window.confirm('Total is ₹0. Proceed with free order?')) return;

    busy.current = true;
    setLoading(true);

    // 1) create the order (status: pending). The server links it to the logged-in
    //    user, or stores it against the email on the form (guest). It must NOT
    //    return a login token: only the OTP login proves ownership of an email.
    let order;
    try {
      const { data } = await axios.post(
        `${API}/orders`,
        {
          shipping: formData,
          is_buy_now: isBuyNow,
          items: orderItems.map((item) => ({ product_id: item.id, quantity: item.quantity })),
        },
        { headers: authHeaders() }
      );
      order = data;
    } catch (err) {
      release();
      setPayError(
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})?.[0]?.[0] ||
        'We could not start your order. Please try again.'
      );
      return;
    }

    // free order: already completed by the server
    if (order.paid) { release(); finishSuccess(); return; }

    // 2) open Razorpay
    const ok = await loadRazorpay();
    if (!ok) {
      reportFailure(order.razorpay_order_id, 'Payment window could not load');
      release();
      setPayError('The payment window could not load. Check your connection and try again.');
      return;
    }

    let settled = false;   // true once the payment succeeded
    const rzp = new window.Razorpay({
      key: order.key || import.meta.env.VITE_RAZORPAY_KEY,
      order_id: order.razorpay_order_id,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'New Project Tracker',
      description: isBuyNow ? orderItems[0].name : 'Project Data Reports',
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: formData.mobile,
      },
      theme: { color: '#1d4ed8' },

      // 3a) paid -> the server checks the signature, then marks the order paid and emails the reports
      handler: async (res) => {
        settled = true;
        setPayError('');
        try {
          await axios.post(
            `${API}/orders/verify`,
            {
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
            },
            { headers: authHeaders() }
          );
          release();
          finishSuccess();
        } catch (err) {
          release();
          setPayError(
            `Your payment went through but we couldn't confirm it automatically. Please contact support with Payment ID ${res.razorpay_payment_id}.`
          );
        }
      },

      // 3b) the customer closed the Razorpay window -> order is stored as failed
      modal: {
        ondismiss: () => {
          if (settled) return;
          reportFailure(order.razorpay_order_id, 'Payment window closed');
          release();
          setPayError('Payment was not completed. You can try again when you are ready.');
        },
      },
    });

    // 3c) a payment attempt failed (the window stays open so the customer can retry)
    rzp.on('payment.failed', (resp) => {
      const reason = resp?.error?.description || 'Payment failed';
      reportFailure(order.razorpay_order_id, reason, resp?.error?.metadata?.payment_id);
      setPayError(reason);
    });

    rzp.open();
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (paymentSuccess) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-4 text-center mb-3">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Order confirmed</h1>
        <p className="mt-2 text-sm text-slate-500">We sent your reports to</p>
        <p className="mb-4 mt-1 break-all text-base font-semibold text-blue-700">{paidEmail}</p>

        <div className="mb-6 max-w-md rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-700">
          <p>Please wait 5 minutes to receive your reports by email.</p>
          <p className="mt-1.5">
            If you do not receive them, please call or WhatsApp{' '}
            <a href="tel:+919171015659" className="font-semibold text-blue-700 hover:underline">9171015659</a>{' '}
            and we will send you the Excel report and the PDF.
          </p>
          <a
            href={`https://wa.me/919171015659?text=${encodeURIComponent(
              `Hello, I have paid for my reports using ${paidEmail} but have not received them yet. Please send me the Excel report and the PDF.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.38A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.1.82.83-3.03-.2-.31a8.2 8.2 0 1 1 6.97 3.85Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.7-.14-.25-.02-.38.1-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.76-1.85-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.73 2.64 4.2 3.7.59.26 1.05.41 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.16-.47-.28Z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>

        {wasGuest && (
          <p className="mb-8 max-w-sm text-sm text-slate-500">
            If you would like to view your reports and order history here, please verify your email address{' '}
            <span className="font-semibold text-slate-700">{paidEmail}</span> with the code we will send you.
            No password is needed.
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          {wasGuest ? (
            <button
              onClick={() => navigate('/login', { state: { from: '/my-orders', email: paidEmail } })}
              className="rounded-md bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
            >
              Verify email to view reports
            </button>
          ) : (
            <button
              onClick={() => navigate('/my-orders')}
              className="rounded-md bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
            >
              View my orders
            </button>
          )}
          <button onClick={() => navigate('/')} className="rounded-md border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-500">
            Back to store
          </button>
        </div>
      </div>
    );
  }

  // ── Checkout UI ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Checkout</h1>
          {isBuyNow && (
            <p className="mt-1 text-sm text-slate-500">
              You are buying only <span className="font-semibold text-slate-700">{orderItems[0]?.name}</span>. Your cart is unchanged.
            </p>
          )}
        </div>

        <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-8">
          {/* LEFT: billing form */}
          <div className="w-full flex-1">
            {/* CONTACT: who is checking out (signed-in account, or the email for guests) */}
            <div className="mb-5 rounded-lg border border-slate-200 bg-white p-5 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900">Contact</h2>
                {!user && (
                  <Link
                    to="/login"
                    state={{ from: '/checkout' + (isBuyNow ? '?flow=buynow' : '') }}
                    className="text-sm font-semibold text-blue-700 hover:underline"
                  >
                    Sign in
                  </Link>
                )}
              </div>

              {user ? (
                <div className="mt-4 flex items-center gap-3">
                  <div
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold uppercase text-blue-700"
                  >
                    {(user.name || user.email || '?').trim().charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    {user.name && <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>}
                    <p className="break-all text-sm text-slate-600">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="shrink-0 text-sm font-semibold text-blue-700 hover:underline"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="mt-4">
                  <Field label="Email address" name="email" type="email" placeholder="you@example.com" autoComplete="email" inputMode="email"
                    value={formData.email} onChange={handleInput} error={errors.email} />
                  <p className="mt-2 text-xs text-slate-500">
                    No account needed to pay. We will send your reports to this email. To view your order history later,
                    you will verify this email with a code.
                  </p>
                </div>
              )}
            </div>

            {addresses.length > 0 && (
              <div className="mb-5 rounded-lg border border-slate-200 bg-white p-5 sm:p-8">
                <h2 className="text-lg font-bold text-slate-900">Your saved addresses</h2>
                <p className="mb-4 mt-1 text-sm text-slate-500">Pick one to use it, or add a new address below.</p>

                <div role="radiogroup" aria-label="Saved addresses" className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {addresses.map((a) => {
                    const active = selectedAddressId === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => applyAddress(a)}
                        className={`rounded-md border p-4 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                          active ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-300 bg-white hover:border-slate-500'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900">{a.first_name} {a.last_name}</span>
                          {a.is_default && (
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">Default</span>
                          )}
                        </span>
                        <span className="mt-1 block text-slate-600">
                          {[a.address, a.city, a.state, a.pincode, a.country].filter(Boolean).join(', ')}
                        </span>
                        <span className="mt-1 block text-slate-500">{a.mobile}</span>
                        <span className={`mt-2 block text-xs font-semibold ${active ? 'text-blue-700' : 'text-slate-500'}`}>
                          {active ? 'Using this address' : 'Use this address'}
                        </span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={useNewAddress}
                    className="flex min-h-[7rem] items-center justify-center rounded-md border border-dashed border-slate-300 p-4 text-sm font-semibold text-blue-700 hover:border-blue-600 hover:bg-blue-50"
                  >
                    + Add a new address
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900">Billing details</h2>
              <p className="mb-6 mt-1 text-sm text-slate-500">We use these details for your invoice.</p>

              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                <Field label="First name" name="firstName" placeholder="John" autoComplete="given-name"
                  value={formData.firstName} onChange={handleInput} error={errors.firstName} />
                <Field label="Last name" name="lastName" placeholder="Doe" autoComplete="family-name"
                  value={formData.lastName} onChange={handleInput} error={errors.lastName} />

                <Field label="Mobile number" name="mobile" type="tel" placeholder="9876543210" autoComplete="tel" inputMode="tel"
                  value={formData.mobile} onChange={handleInput} error={errors.mobile} />

                <Field label="Country" name="country" as="select" autoComplete="country-name"
                  value={formData.country} onChange={handleInput} error={errors.country}>
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Field>

                {formData.country === 'India' && (
                  <Field label="State" name="state" as="select" autoComplete="address-level1"
                    value={formData.state} onChange={handleInput} error={errors.state}>
                    <option value="">Select state</option>
                    {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Field>
                )}

                <Field label="City" name="city" placeholder="Mumbai" autoComplete="address-level2"
                  value={formData.city} onChange={handleInput} error={errors.city} />
                <Field label="Pincode" name="pincode" placeholder="400001" autoComplete="postal-code" inputMode="numeric"
                  value={formData.pincode} onChange={handleInput} error={errors.pincode} />

                <Field label="Address" name="address" placeholder="House, street, area" span optional autoComplete="street-address"
                  value={formData.address} onChange={handleInput} />
              </div>
            </div>

            <p className="mt-4 flex items-center gap-2 px-1 text-xs text-slate-500">
              <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Your payment is handled by Razorpay. We never store your card details.
            </p>
          </div>

          {/* RIGHT: order summary (sticky on desktop only) */}
          <aside className="w-full lg:sticky lg:top-28 lg:w-[380px] lg:shrink-0">
            <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Order summary</h2>

              <ul className="mt-4 max-h-64 divide-y divide-slate-100 overflow-y-auto">
                {orderItems.length === 0 ? (
                  <li className="py-6 text-center">
                    <p className="text-sm text-slate-500">Your cart is empty.</p>
                    <button onClick={() => navigate('/report')} className="mt-2 text-sm font-semibold text-blue-700 hover:underline">
                      Browse reports
                    </button>
                  </li>
                ) : (
                  orderItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 py-3">
                      <div className="flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100">
                        {item.image ? (
                          <img src={`${import.meta.env.VITE_SERVER_URL}/storage/${item.image}`} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-lg text-slate-300">📊</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium leading-snug text-slate-800">{item.name}</p>
                        {item.quantity > 1 && <p className="mt-0.5 text-xs text-slate-500">Qty {item.quantity}</p>}
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-slate-900">₹{inr(item.price * item.quantity)}</span>
                    </li>
                  ))
                )}
              </ul>

              <dl className="mt-3 space-y-2 border-t border-slate-200 pt-4 text-sm">
                <div className="flex justify-between text-slate-600">
                  <dt>Subtotal</dt><dd>₹{inr(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                  <dt>GST (18%)</dt><dd>₹{inr(taxAmount)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                  <dt>Total</dt><dd>₹{inr(finalTotal)}</dd>
                </div>
              </dl>

              {payError && (
                <div role="alert" className="mt-5 flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{payError}</span>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={loading || orderItems.length === 0}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Processing
                  </>
                ) : (
                  <>Pay ₹{inr(finalTotal)}</>
                )}
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">Secured by Razorpay</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}