import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  selectCartItems, selectCartTotal, selectCartCount, selectCartLoading,
  removeFromCart,
} from "../store/cartSlice";

const inr = (n) => Number(n || 0).toLocaleString("en-IN");

// Slide-in mini cart (opens when the header cart icon is clicked)
export default function CartDrawer({ open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);
  const loading = useSelector(selectCartLoading);

  // keep the latest onClose without re-running the effect on every parent render
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const closeBtnRef = useRef(null);

  // close on Esc, lock page scroll, and move focus into the drawer while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = (path) => { onClose(); navigate(path); };

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[1000] bg-slate-900/50 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {/* panel */}
      <aside
        role="dialog" aria-modal="true" aria-label="Your cart" inert={!open}
        className={`fixed right-0 top-0 z-[1001] flex h-full w-full max-w-[400px] flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">
            Your cart <span className="text-sm font-medium text-slate-500">({count})</span>
          </h2>
          <button ref={closeBtnRef} onClick={onClose} aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-5">
          {loading && items.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" role="status" aria-label="Loading cart" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">🛒</div>
              <div>
                <p className="font-semibold text-slate-900">Your cart is empty</p>
                <p className="mt-1 text-sm text-slate-500">Add a report to see it here.</p>
              </div>
              <button onClick={() => go("/report")}
                className="rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900">
                Browse reports
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((item) => {
                const price = Number(item.product?.active_price || item.product?.price || item.active_price || item.price || 0);
                const name = item.product?.name || item.name || "Project report";
                const slug = item.product?.slug || item.slug;
                const image = item.product?.images?.[0]?.path || item.image;
                const qty = Number(item.quantity) || 1;

                const title = (
                  <span className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 hover:text-blue-700">{name}</span>
                );

                return (
                  <li key={item.id} className="flex gap-3 py-4">
                    <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100">
                      {image ? (
                        <img src={`${import.meta.env.VITE_SERVER_URL}/storage/${image}`} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-xl text-slate-300">📊</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {slug ? <Link to={`/report/${slug}`} onClick={onClose}>{title}</Link> : title}
                      <p className="mt-1.5 text-sm font-bold text-slate-900">
                        ₹{inr(price * qty)}
                        {qty > 1 && <span className="ml-2 text-xs font-normal text-slate-500">₹{inr(price)} × {qty}</span>}
                      </p>
                    </div>

                    <button onClick={() => dispatch(removeFromCart(item.id))} aria-label={`Remove ${name}`}
                      className="-mr-1 self-start rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Subtotal</span>
              <span className="text-lg font-bold text-slate-900">₹{inr(total)}</span>
            </div>
            <button onClick={() => go("/checkout")}
              className="mb-2.5 w-full rounded-md bg-blue-700 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
              Proceed to checkout
            </button>
            <button onClick={() => go("/cart")}
              className="w-full rounded-md border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-800 hover:border-slate-500">
              View cart
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">GST is added at checkout.</p>
          </div>
        )}
      </aside>
    </>
  );
}