import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  selectCartItems, selectCartTotal, selectCartCount, selectCartLoading,
  removeFromCart, clearCartAsync,
} from "../store/cartSlice";
import useSeo from "../hooks/useSeo";

const inr = (n) => Number(n || 0).toLocaleString("en-IN");
const ALL_REPORTS_PATH = "/report";

// Works with both cart shapes: { product: {...} } from the API, or flat { name, price, image }
const read = (item) => {
  const p = item.product || {};
  return {
    name: p.name || item.name || "Project report",
    price: Number(p.active_price || p.price || item.active_price || item.price || 0),
    image: p.images?.[0]?.path || item.image,
    slug: p.slug,
    qty: Number(item.quantity) || 1,
    meta: [p.state, p.industry, p.year].filter(Boolean),
  };
};

export default function CartPage() {
  useSeo({ title: "Your Cart", noindex: true });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);
  const loading = useSelector(selectCartLoading);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" role="status" aria-label="Loading cart" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">🛒</div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Your cart is empty</h1>
          <p className="mt-1 text-sm text-slate-500">Add a report to see it here.</p>
        </div>
        <Link to={ALL_REPORTS_PATH} className="rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900">
          Browse reports
        </Link>
      </div>
    );
  }

  const clearCart = () => {
    if (window.confirm("Remove all reports from your cart?")) dispatch(clearCartAsync());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 md:px-8">
        <div className="mb-6 flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Your cart</h1>
            <p className="mt-1 text-sm text-slate-500">
              {count} {count === 1 ? "report" : "reports"}
            </p>
          </div>
          <button onClick={clearCart} className="text-sm font-semibold text-slate-500 hover:text-rose-600 hover:underline">
            Clear cart
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Items */}
          <ul className="flex flex-col gap-3 lg:col-span-2">
            {items.map((item) => {
              const { name, price, image, slug, qty, meta } = read(item);
              const title = (
                <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-blue-700 sm:text-base">{name}</h2>
              );
              return (
                <li key={item.id} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:gap-4 sm:p-4">
                  <div className="flex h-24 w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 sm:h-28 sm:w-20">
                    {image ? (
                      <img src={`${import.meta.env.VITE_SERVER_URL}/storage/${image}`} alt={name} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-2xl text-slate-300">📊</span>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      {slug ? <Link to={`/product-view/${slug}`} className="group min-w-0">{title}</Link> : <div className="group min-w-0">{title}</div>}
                      <button
                        onClick={() => dispatch(removeFromCart(item.id))}
                        aria-label={`Remove ${name}`}
                        className="-mr-1 -mt-1 shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18 6 6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    {meta.length > 0 && <p className="mt-1 text-xs text-slate-500">{meta.join(" | ")}</p>}

                    <div className="mt-auto flex items-baseline gap-2 pt-2">
                      <span className="text-lg font-bold text-slate-900">₹{inr(price * qty)}</span>
                      {qty > 1 && <span className="text-xs text-slate-500">₹{inr(price)} × {qty}</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Summary */}
          <aside className="lg:col-span-1">
            <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-bold text-slate-900">Order summary</h2>

              <ul className="mt-4 space-y-2 border-b border-slate-100 pb-4">
                {items.map((item) => {
                  const { name, price, qty } = read(item);
                  return (
                    <li key={item.id} className="flex justify-between gap-3 text-sm text-slate-600">
                      <span className="line-clamp-1 min-w-0 flex-1">{name}</span>
                      <span className="shrink-0 font-medium text-slate-800">₹{inr(price * qty)}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center justify-between py-4">
                <span className="font-semibold text-slate-600">Total</span>
                <span className="text-2xl font-bold text-slate-900">₹{inr(total)}</span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full rounded-md bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                Proceed to checkout
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">Download your reports as soon as the payment goes through.</p>

              <Link to={ALL_REPORTS_PATH} className="mt-4 block text-center text-sm font-semibold text-blue-700 hover:underline">
                Continue shopping
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}