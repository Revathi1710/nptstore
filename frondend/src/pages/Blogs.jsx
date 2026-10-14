import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const BLOGS_PER_PAGE = 6;

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

const stripHtml = (html) => (html ? html.replace(/(<([^>]+)>)/gi, "").replace(/\*+/g, "").trim() : "");

const excerpt = (text, len = 140) => {
  const clean = stripHtml(text);
  return clean.length > len ? clean.substring(0, len) + "…" : clean;
};

// page numbers with gaps, e.g. 1 … 4 5 6 … 12
const pageList = (cur, last) => {
  const nums = [...new Set([1, last, cur - 1, cur, cur + 1])].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push(`gap-${n}`);
    out.push(n);
  });
  return out;
};

const pageBtn = "h-9 min-w-9 rounded-md border px-2 text-sm font-medium transition";

const BlogCard = ({ blog }) => (
  <article className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-slate-400">
    <Link to={`/blogs/${blog.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">
      {blog.featured_image ? (
        <img
          src={`${import.meta.env.VITE_SERVER_URL}/storage/${blog.featured_image}`}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-4xl text-slate-300">📰</div>
      )}
      {blog.category && (
        <span className="absolute left-3 top-3 rounded bg-white px-2 py-0.5 text-xs font-semibold text-blue-700 shadow-sm">
          {blog.category}
        </span>
      )}
    </Link>

    <div className="flex flex-1 flex-col p-5">
      <p className="text-xs text-slate-500">
        {formatDate(blog.published_at || blog.created_at)}
        <span className="mx-1.5 text-slate-300">|</span>
        {blog.author || "New Projects Tracker"}
      </p>

      <h2 className="mt-2 line-clamp-3 text-base font-semibold leading-snug text-slate-900 group-hover:text-blue-700">
        <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
      </h2>

      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
        {excerpt(blog.short_description || blog.content)}
      </p>

      <Link to={`/blogs/${blog.slug}`} className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-blue-700 hover:underline">
        Read more <span aria-hidden="true">→</span>
      </Link>
    </div>
  </article>
);

const SkeletonBlog = () => (
  <div className="animate-pulse overflow-hidden rounded-lg border border-slate-200 bg-white">
    <div className="aspect-[16/9] bg-slate-100" />
    <div className="space-y-3 p-5">
      <div className="h-3 w-1/3 rounded bg-slate-100" />
      <div className="h-4 w-full rounded bg-slate-100" />
      <div className="h-4 w-2/3 rounded bg-slate-100" />
      <div className="h-3 w-full rounded bg-slate-100" />
    </div>
  </div>
);

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/blogs?status=published`)
      .then((res) => setBlogs(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(blogs.length / BLOGS_PER_PAGE);
  const paginated = blogs.slice((page - 1) * BLOGS_PER_PAGE, page * BLOGS_PER_PAGE);

  const goTo = (n) => {
    setPage(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-slate-50 text-slate-800">
      {/* Hero: same light blue as the home banner */}
      <section className="border-b border-blue-100 bg-gradient-to-b from-[#EFF6FF] via-[#F4F8FF] to-[#EBF3FE] px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl md:px-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Blogs</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Latest project updates, industry insights and state reports from New Projects Tracker.
          </p>
        </div>
      </section>

      <div className="mx-auto min-h-[50vh] max-w-7xl px-4 py-10 md:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(BLOGS_PER_PAGE)].map((_, i) => <SkeletonBlog key={i} />)}
          </div>
        ) : paginated.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-16 text-center">
            <p className="font-semibold text-slate-800">No blogs published yet</p>
            <p className="mt-1 text-sm text-slate-500">Check back soon for new articles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((blog) => <BlogCard key={blog.id} blog={blog} />)}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-12 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
            <button onClick={() => goTo(page - 1)} disabled={page === 1}
              className={`${pageBtn} border-slate-300 bg-white text-slate-700 hover:border-slate-500 disabled:pointer-events-none disabled:opacity-40`}>
              Previous
            </button>
            {pageList(page, totalPages).map((n) =>
              typeof n === "string" ? (
                <span key={n} className="px-1 text-slate-400">…</span>
              ) : (
                <button key={n} onClick={() => goTo(n)} aria-current={page === n ? "page" : undefined}
                  className={`${pageBtn} ${page === n ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"}`}>
                  {n}
                </button>
              )
            )}
            <button onClick={() => goTo(page + 1)} disabled={page === totalPages}
              className={`${pageBtn} border-slate-300 bg-white text-slate-700 hover:border-slate-500 disabled:pointer-events-none disabled:opacity-40`}>
              Next
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Blogs;