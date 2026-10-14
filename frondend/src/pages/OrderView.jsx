import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import AccountNav from '../components/AccountNav'; // adjust path if needed
import useSeo from '../hooks/useSeo';

const STATUS = {
  paid: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  failed: { label: 'Failed', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  refunded: { label: 'Refunded', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' });

// File types offered for every report
const FILES = [
  { type: 'pdf', label: 'PDF', ext: 'pdf', Icon: FileText, cls: 'border-rose-200 text-rose-700 hover:bg-rose-50' },
  { type: 'excel', label: 'Excel', ext: 'xlsx', Icon: FileSpreadsheet, cls: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' },
];

const OrderItem = ({ order, item }) => {
  const [busy, setBusy] = useState(''); // "pdf" | "excel" | ""
  const [err, setErr] = useState('');
  const product = item.product || {};
  const productId = item.product_id ?? product.id;
  const img = product.images?.[0]?.path;
  const canDownload = order.status === 'paid';

  const download = async (file) => {
    setBusy(file.type);
    setErr('');
    try {
      const res = await axios.get(`${API}/orders/${order.id}/items/${productId}/download/${file.type}`, {
        headers: authHeaders(),
        responseType: 'blob',
      });

      // Create object URL only when request succeeds
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${product.slug || `report-${productId}`}.${file.ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      let message = `Could not download the ${file.label} file. Try again or contact support.`;

      if (e.response?.data instanceof Blob) {
        try {
          const text = await e.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed.message) message = parsed.message;
        } catch (err) {
          // Fallback to default message
        }
      }

      setErr(message);
    } finally {
      setBusy('');
    }
  };

  return (
    <li className="p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100">
          {img ? (
            <img src={`${import.meta.env.VITE_SERVER_URL}/storage/${img}`} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-2xl text-slate-300">📊</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {product.slug ? (
            <Link to={`/report/${product.slug}`} className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-blue-700 sm:text-base">
              {product.name || 'Report'}
            </Link>
          ) : (
            <p className="line-clamp-2 text-sm font-semibold text-slate-900 sm:text-base">{product.name || 'Report'}</p>
          )}
          <p className="mt-0.5 text-sm text-slate-500">₹{fmt(item.price * item.quantity)}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {FILES.map((f) => (
              <button
                key={f.type}
                type="button"
                onClick={() => download(f)}
                disabled={!canDownload || !!busy}
                className={`inline-flex items-center gap-2 rounded-md border bg-white px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${f.cls}`}
              >
                {busy === f.type ? <Loader2 size={16} className="animate-spin" /> : <f.Icon size={16} />}
                Download {f.label}
              </button>
            ))}
          </div>

          {!canDownload && <p className="mt-2 text-xs text-slate-500">Downloads unlock once the payment is confirmed.</p>}
          {err && <p className="mt-2 text-xs font-medium text-rose-600">{err}</p>}
        </div>
      </div>
    </li>
  );
};

export default function OrderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // must come after the useState lines so `order` exists
  useSeo({ title: order ? `Order #${order.id}` : 'Order Details', noindex: true });

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    let alive = true;
    (async () => {
      try {
        // uses the existing list endpoint, so no new "show" route is needed
        const res = await axios.get(`${API}/my-orders`, { headers: authHeaders() });
        const found = (res.data.data || []).find((o) => String(o.id) === String(id));
        if (!alive) return;
        if (found) setOrder(found);
        else setError('We could not find this order.');
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) navigate('/login');
        else if (alive) setError('We could not load this order. Refresh the page to try again.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, navigate]);

  const s = order ? STATUS[order.status] || STATUS.pending : null;
  const billing = order ? [order.address, order.city, order.pincode].filter(Boolean).join(', ') : '';

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
        <Link to="/my-orders" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">
          <ArrowLeft size={16} /> Back to my orders
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-3"><AccountNav active="orders" /></aside>

          <div className="lg:col-span-9">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-lg border border-slate-200 bg-white" />)}
              </div>
            ) : error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-6 text-center text-sm font-medium text-rose-800">{error}</div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order #{order.id}</h1>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
                  <span className="text-sm text-slate-500">{fmtDate(order.created_at)}</span>
                </div>

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 sm:px-5">Your reports</h2>
                  <ul className="divide-y divide-slate-100">
                    {order.items?.map((item, idx) => <OrderItem key={idx} order={order} item={item} />)}
                  </ul>
                </section>

                <div className="mt-4 grid grid-cols-1 overflow-hidden rounded-lg border border-slate-200 bg-white md:grid-cols-2">
                  <dl className="space-y-2 p-4 text-sm sm:p-5">
                    <h3 className="mb-2 font-semibold text-slate-900">Payment summary</h3>
                    <div className="flex justify-between text-slate-600"><dt>Subtotal</dt><dd>₹{fmt(order.subtotal)}</dd></div>
                    <div className="flex justify-between text-slate-600"><dt>Tax</dt><dd>₹{fmt(order.tax)}</dd></div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900"><dt>Total</dt><dd>₹{fmt(order.total)}</dd></div>
                  </dl>
                  <div className="border-t border-slate-200 p-4 text-sm sm:p-5 md:border-l md:border-t-0">
                    <h3 className="mb-2 font-semibold text-slate-900">Billing details</h3>
                    <p className="font-medium text-slate-800">{order.customer_name}</p>
                    {billing && <p className="mt-1 leading-relaxed text-slate-600">{billing}</p>}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}