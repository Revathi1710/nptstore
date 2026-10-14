import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Check, Link2, ImageOff, SearchX } from "lucide-react";

const API = import.meta.env.VITE_API_URL;
const SERVER = import.meta.env.VITE_SERVER_URL;

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

const LABELS = [
  "Project Promoter",
  "Products & Capacity",
  "Project Location",
  "Proposed Investment",
  "Project Completion",
  "Executive Summary",
];

const stripHtml = (t) => t.replace(/(<([^>]+)>)/gi, "").replace(/\*+/g, "");

// ── Small pieces ──────────────────────────────────────────────────────────────
const Dot = () => (
  <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
);

const Chip = ({ children }) => (
  <span className="inline-block w-fit rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-semibold text-blue-700">
    {children}
  </span>
);

const Row = ({ label, value }) => (
  <p className="mb-2 text-[15px] leading-7 text-slate-700">
    <strong className="font-semibold text-slate-900">{label}</strong>
    <span className="text-slate-400"> : </span>
    {value}
  </p>
);

const Summary = ({ children }) => (
  <div className="mt-3">
    <p className="mb-1 text-[15px] font-semibold text-slate-900">Executive summary</p>
    <p className="text-[15px] leading-7 text-slate-600">{children}</p>
  </div>
);

const Intro = ({ children }) => (
  <p className="mb-8 border-l-4 border-blue-700 pl-4 text-base leading-7 text-slate-600">
    {children}
  </p>
);

const ProjectBlock = ({ last, children }) => (
  <div
    className={
      last ? "" : "mb-8 border-b border-dashed border-slate-200 pb-8"
    }
  >
    {children}
  </div>
);

// CASE A: structured rows from the blog_projects table
const StructuredProjects = ({ projects, shortDesc }) => (
  <>
    {shortDesc && (
      <Intro>{stripHtml(shortDesc).split("\n")[0].trim()}</Intro>
    )}
    {projects.map((proj, i) => {
      const rows = [
        { label: "Project Promoter", value: proj.promoter },
        { label: "Products & Capacity", value: proj.products_capacity },
        { label: "Project Location", value: proj.location },
        { label: "Proposed Investment", value: proj.investment },
        { label: "Project Completion", value: proj.completion },
      ].filter((r) => r.value);

      if (!rows.length && !proj.summary) return null;

      return (
        <ProjectBlock key={proj.id ?? i} last={i === projects.length - 1}>
          {rows.map((r) => (
            <Row key={r.label} {...r} />
          ))}
          {proj.summary && <Summary>{proj.summary}</Summary>}
        </ProjectBlock>
      );
    })}
  </>
);

// CASE B: no rows, parse the plain text in short_description
const ParsedDescription = ({ text }) => {
  if (!text) return null;

  const blocks = stripHtml(text)
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const isLabelLine = (line) => LABELS.some((l) => line.startsWith(l));

  return (
    <div>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

        if (!lines.some(isLabelLine)) {
          return bi === 0 ? (
            <Intro key={bi}>{block}</Intro>
          ) : (
            <p key={bi} className="mb-6 text-base leading-7 text-slate-600">
              {block}
            </p>
          );
        }

        const last = !blocks
          .slice(bi + 1)
          .some((b) => b.split("\n").some(isLabelLine));

        return (
          <ProjectBlock key={bi} last={last}>
            {lines.map((line, li) => {
              const matched = LABELS.find((l) => line.startsWith(l));
              if (!matched) {
                return (
                  <p key={li} className="mb-1.5 text-[15px] leading-7 text-slate-600">
                    {line}
                  </p>
                );
              }
              const idx = line.indexOf(" : ");
              const label = idx !== -1 ? line.substring(0, idx) : matched;
              const value =
                idx !== -1
                  ? line.substring(idx + 3)
                  : line.replace(matched, "").replace(/^[\s:]+/, "");

              return label === "Executive Summary" ? (
                <Summary key={li}>{value}</Summary>
              ) : (
                <Row key={li} label={label} value={value} />
              );
            })}
          </ProjectBlock>
        );
      })}
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SideCard = ({ title, children }) => (
  <section className="rounded-lg border border-slate-200 bg-white p-5">
    <h2 className="mb-4 border-b border-slate-100 pb-3 text-sm font-semibold text-slate-900">
      {title}
    </h2>
    {children}
  </section>
);

const ShareButtons = ({ title }) => {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: ignore */
    }
  };

  const btn =
    "flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

  return (
    <div className="flex gap-2">
      <a
        className={btn}
        target="_blank"
        rel="noreferrer"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
      >
        LinkedIn
      </a>
      <a
        className={btn}
        target="_blank"
        rel="noreferrer"
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
      >
        X
      </a>
      <button type="button" onClick={copy} className={btn} aria-live="polite">
        {copied ? <Check size={14} /> : <Link2 size={14} />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
};

const RecentPosts = ({ posts }) =>
  posts.length === 0 ? (
    <p className="text-sm text-slate-500">No other posts yet.</p>
  ) : (
    <ul className="space-y-4">
      {posts.map((rb) => (
        <li key={rb.id}>
          <Link
            to={`/blogs/${rb.slug}`}
            className="group flex items-start gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <div className="flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100">
              {rb.featured_image ? (
                <img
                  src={`${SERVER}/storage/${rb.featured_image}`}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageOff size={16} className="text-slate-300" aria-hidden="true" />
              )}
            </div>
            <span className="line-clamp-3 text-sm font-medium leading-5 text-slate-800 group-hover:text-blue-700">
              {rb.title}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );

// ── Page ──────────────────────────────────────────────────────────────────────
const ViewBlog = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    window.scrollTo(0, 0);
    setLoading(true);
    setFailed(false);

    axios
      .get(`${API}/blogs/slug/${slug}`)
      .then((res) => {
        if (!cancelled) setBlog(res.data.data);
      })
      .catch(() => {
        if (!cancelled) {
          setBlog(null);
          setFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Sidebar posts load separately so a failure here never hides the article
    axios
      .get(`${API}/blogs`, { params: { status: "published", limit: 6 } })
      .then((res) => {
        if (cancelled) return;
        const all = Array.isArray(res.data.data) ? res.data.data : [];
        setRecent(all.filter((b) => b.slug !== slug).slice(0, 5));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-slate-50" aria-busy="true">
        <div className="mx-auto max-w-6xl animate-pulse px-4 py-10 sm:px-6">
          <div className="mb-4 h-5 w-24 rounded bg-slate-200" />
          <div className="mb-8 h-9 w-3/4 rounded bg-slate-200" />
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-8">
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-5/6 rounded bg-slate-100" />
            <div className="h-4 w-2/3 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (failed || !blog) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <SearchX size={40} className="mb-4 text-slate-300" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-slate-900">Blog not found</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">
          This post doesn't exist or has been removed.
        </p>
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-900"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to blogs
        </Link>
      </div>
    );
  }

  const hasProjects = Array.isArray(blog.projects) && blog.projects.length > 0;

  return (
    <div className="bg-slate-50">
      {/* Hero */}
      <header className="border-b border-blue-100 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <Link
            to="/blogs"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
          >
            <ArrowLeft size={16} aria-hidden="true" /> All blogs
          </Link>
          <div className="flex flex-col gap-3">
            {blog.category && <Chip>{blog.category}</Chip>}
            <h1 className="max-w-3xl text-2xl font-semibold leading-tight tracking-tight text-slate-900 md:text-4xl">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <time dateTime={blog.published_at || blog.created_at}>
                {formatDate(blog.published_at || blog.created_at)}
              </time>
              <Dot />
              <span>{blog.author || "New Projects Tracker"}</span>
              {blog.blog_type && (
                <>
                  <Dot />
                  <span className="capitalize">{blog.blog_type.replace(/_/g, " ")}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 md:py-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {blog.featured_image && (
            <img
              src={`${SERVER}/storage/${blog.featured_image}`}
              alt={blog.title}
              className="aspect-[16/9] w-full border-b border-slate-200 object-cover"
            />
          )}

          <div className="p-5 sm:p-8">
            {hasProjects ? (
              <StructuredProjects
                projects={blog.projects}
                shortDesc={blog.short_description}
              />
            ) : (
              <ParsedDescription text={blog.short_description} />
            )}

            {blog.content && (
              <div className="mt-8 border-t border-slate-100 pt-8">
                <div
                  className="text-[15px] leading-7 text-slate-700"
                  dangerouslySetInnerHTML={{
                    __html: blog.content.replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-5 py-4 sm:px-8">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
            >
              <ArrowLeft size={16} aria-hidden="true" /> Back to blogs
            </Link>
          </div>
        </article>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <SideCard title="Recent posts">
            <RecentPosts posts={recent} />
          </SideCard>
          <SideCard title="Share">
            <ShareButtons title={blog.title} />
          </SideCard>
        </aside>
      </div>
    </div>
  );
};

export default ViewBlog;