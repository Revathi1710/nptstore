import React from "react";

// Renders the plain text saved by the admin rich-text toolbar
// (**bold**, _italic_, [text](url), ![alt](url), "• item", "1. item", "> quote").
// No dangerouslySetInnerHTML, and only http(s)/relative/mailto links are allowed.
const SAFE_URL = /^(https?:\/\/|\/|mailto:)/i;
const INLINE = /(!\[[^\]]*\]\([^)]+\)|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|(?<!\w)_[^_\n]+_(?!\w))/g;

function inline(text) {
  return text.split(INLINE).map((p, i) => {
    if (!p) return null;
    let m;
    if ((m = p.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)))
      return SAFE_URL.test(m[2]) ? <img key={i} src={m[2]} alt={m[1]} className="max-w-full rounded-lg my-2" /> : null;
    if ((m = p.match(/^\*\*([^*]+)\*\*$/))) return <strong key={i} className="font-bold text-slate-800">{m[1]}</strong>;
    if ((m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/)))
      return SAFE_URL.test(m[2])
        ? <a key={i} href={m[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{m[1]}</a>
        : m[1];
    if ((m = p.match(/^_([^_\n]+)_$/))) return <em key={i}>{m[1]}</em>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

export default function RichText({ text, className = "" }) {
  if (!text || !text.trim()) return null;

  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let list = null; // { type: 'ul' | 'ol', items: [] }

  const flush = () => { if (list) { blocks.push(list); list = null; } };

  lines.forEach((raw) => {
    const line = raw.trim();
    if (!line) { flush(); return; }

    let m;
    if ((m = line.match(/^[•\-*]\s+(.*)$/))) {
      if (!list || list.type !== "ul") { flush(); list = { type: "ul", items: [] }; }
      list.items.push(m[1]);
    } else if ((m = line.match(/^\d+[.)]\s+(.*)$/))) {
      if (!list || list.type !== "ol") { flush(); list = { type: "ol", items: [] }; }
      list.items.push(m[1]);
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      flush(); blocks.push({ type: "quote", text: m[1] });
    } else if (/^Q[:.]/i.test(line)) {
      flush(); blocks.push({ type: "q", text: line });
    } else {
      flush(); blocks.push({ type: "p", text: line });
    }
  });
  flush();

  return (
    <div className={`text-[15px] leading-7 text-slate-600 space-y-3 ${className}`}>
      {blocks.map((b, i) => {
        if (b.type === "ul")
          return <ul key={i} className="list-disc pl-5 space-y-1.5 marker:text-blue-500">{b.items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ul>;
        if (b.type === "ol")
          return <ol key={i} className="list-decimal pl-5 space-y-1.5 marker:text-blue-500 marker:font-bold">{b.items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ol>;
        if (b.type === "quote")
          return <blockquote key={i} className="border-l-4 border-blue-500 bg-blue-50/60 px-4 py-2 rounded-r-lg text-slate-700">{inline(b.text)}</blockquote>;
        if (b.type === "q")
          return <p key={i} className="font-bold text-slate-900 pt-2">{inline(b.text)}</p>;
        return <p key={i}>{inline(b.text)}</p>;
      })}
    </div>
  );
}