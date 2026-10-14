import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, selectCartItems } from "../store/cartSlice";
import { ProductCard, SkeletonCard, Toast } from "./ProductCard";

const PER_PAGE = 8; // 2 full rows of 4, matching the design
const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"; // shared by skeleton + real grid so the layout doesn't jump

export default function HomePageProducts() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("latest");
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  useEffect(() => {
    let alive = true; // ignore stale responses if the sort changes quickly
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
          params: { search, category, sort, per_page: PER_PAGE },
        });
        if (alive) setProducts((Array.isArray(data.data) ? data.data : []).slice(0, PER_PAGE));
      } catch (error) {
        console.error("Failed to load products:", error);
        if (alive) setProducts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [search, category, sort]);

  const handleAdd = async (product) => {
    if (cartItems.some((i) => i.product_id === product.id)) {
      showToast("This report is already in your cart", "error");
      return;
    }
    try {
      setAddingId(product.id);
      await dispatch(
        addToCart({
          product_id: product.id,
          name: product.name,
          price: product.price,
          active_price: product.active_price,
          image: product.images?.[0]?.path || null,
        })
      ).unwrap();
      showToast("Added to cart", "success");
    } catch {
      showToast("Couldn't add this report. Try again.", "error");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <section className="bg-white py-14 text-slate-800 md:py-16">
      <Toast {...toast} />

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-7 flex flex-col gap-3 border-b border-slate-200 pb-[18px] sm:flex-row sm:items-end sm:justify-between sm:gap-5">
          <div className="min-w-0">
            <h2 className="break-words text-2xl font-bold tracking-tight text-slate-900">
              {search ? `Results for “${search}”` : "Latest reports"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {search
                ? loading ? "Loading reports" : `Showing ${products.length} report${products.length === 1 ? "" : "s"}`
                : "New editions every six months, by state and by segment."}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-5">
            <label className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
              <span className="shrink-0">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="min-w-0 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm font-medium text-slate-800 outline-none focus:border-[#1A4FE0] focus:ring-2 focus:ring-blue-100 sm:px-3"
              >
                <option value="latest">Latest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </label>
            <Link to="/report" className="shrink-0 text-sm font-semibold text-[#1A4FE0] hover:underline">
              View all reports →
            </Link>
          </div>
        </div>

        {loading ? (
          <div className={GRID}>
            {[...Array(PER_PAGE)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-12 text-center sm:py-16">
            <p className="font-semibold text-slate-800">No reports found</p>
            <p className="mt-1 text-sm text-slate-500">Check the spelling or search for a state or industry instead.</p>
          </div>
        ) : (
          <div className={GRID}>
            {products.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                inCart={cartItems.some((i) => i.product_id === p.id)}
                adding={addingId === p.id}
                onAdd={handleAdd}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}