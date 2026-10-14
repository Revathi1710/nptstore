import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, ChevronDown } from 'lucide-react';
import AccountNav from '../components/AccountNav'; // adjust path if needed
import useSeo from "../hooks/useSeo";
const STATUS = {
  paid: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  failed: { label: 'Failed', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  refunded: { label: 'Refunded', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);
  const s = STATUS[order.status] || STATUS.pending;
  const count = order.items?.length || 0;
  const billing = [order.address, order.city, order.pincode].filter(Boolean).join(', ');

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-slate-50 sm:p-5"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">Order #{order.id}</span>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{fmtDate(order.created_at)} | {count} {count === 1 ? 'report' : 'reports'}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <div className="text-right">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-base font-bold text-slate-900 sm:text-lg">₹{fmt(order.total)}</p>
          </div>
          <ChevronDown size={20} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-200">
          <ul className="divide-y divide-slate-100 px-4 sm:px-5">
            {order.items?.map((item, idx) => {
              const img = item.product?.images?.[0]?.path;
              return (
                <li key={idx} className="flex items-center gap-3 py-3">
                  <div className="flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100">
                    {img ? (
                      <img src={`${import.meta.env.VITE_SERVER_URL}/storage/${img}`} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-lg text-slate-300">📊</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {item.product?.slug ? (
                      <Link to={`/report/${item.product.slug}`} className="line-clamp-2 text-sm font-medium text-slate-900 hover:text-blue-700">
                        {item.product?.name || 'Report'}
                      </Link>
                    ) : (
                      <p className="line-clamp-2 text-sm font-medium text-slate-900">{item.product?.name || 'Report'}</p>
                    )}
                    {item.quantity > 1 && <p className="mt-0.5 text-xs text-slate-500">₹{fmt(item.price)} × {item.quantity}</p>}
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-slate-900">₹{fmt(item.price * item.quantity)}</span>
               <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
  <Link to={`/my-orders/${order.id}`} className="text-sm font-semibold text-blue-700 hover:underline">
    View order &amp; download files →
  </Link>
</div>
                </li>
              );
            })}
          </ul>

          <div className="grid grid-cols-1 border-t border-slate-200 bg-slate-50 md:grid-cols-2">
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
        </div>
      )}
    </article>
  );
};

export const MyOrder = () => {
  useSeo({ title: "My Orders", noindex: true });
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/my-orders`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        setOrders(res.data.data || []);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) navigate('/login');
        else setError('We could not load your orders. Refresh the page to try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My orders</h1>
          <p className="mt-1 text-sm text-slate-500">View your past purchases and payment details.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-3"><AccountNav active="orders" /></aside>

          <div className="lg:col-span-9">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg border border-slate-200 bg-white" />)}
              </div>
            ) : error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-6 text-center text-sm font-medium text-rose-800">{error}</div>
            ) : orders.length > 0 ? (
              <div className="space-y-3">{orders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400"><ShoppingBag size={26} /></div>
                <h2 className="text-lg font-bold text-slate-900">No orders yet</h2>
                <p className="mt-1 text-sm text-slate-500">Reports you buy will show up here.</p>
                <Link to="/report" className="mt-5 inline-block rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900">Browse reports</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrder;