import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../component/Sidebar';
import { useNavigate } from 'react-router-dom';

const AllBlogs = () => {
  const [blogs, setBlogs]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [deleteModal, setDeleteModal]   = useState({ open: false, blog: null });
  const [deleting, setDeleting]         = useState(false);
  const [selectedIds, setSelectedIds]   = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
const navigate=useNavigate();
  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterOpen,     setFilterOpen]     = useState(false);
  const [filterTitle,    setFilterTitle]    = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType,     setFilterType]     = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');
  const filterRef = useRef(null);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/blogs`);
      setBlogs(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const activeFilterCount = [filterTitle, filterCategory, filterType, filterStatus].filter(Boolean).length;

  const filteredBlogs = blogs.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      b.title?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q);

    const matchTitle    = !filterTitle    || b.title?.toLowerCase().includes(filterTitle.toLowerCase());
    const matchCategory = !filterCategory || b.category === filterCategory;
    const matchType     = !filterType     || b.blog_type === filterType;
    const matchStatus   = !filterStatus   || b.status === filterStatus;

    return matchSearch && matchTitle && matchCategory && matchType && matchStatus;
  });

  const clearFilters = () => {
    setFilterTitle(''); setFilterCategory(''); setFilterType(''); setFilterStatus('');
  };

  // ── Select all ────────────────────────────────────────────────────────────
  const allSelected = filteredBlogs.length > 0 && filteredBlogs.every(b => selectedIds.includes(b.id));
  const toggleAll   = () => allSelected ? setSelectedIds([]) : setSelectedIds(filteredBlogs.map(b => b.id));
  const toggleOne   = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const openDelete  = (blog) => setDeleteModal({ open: true, blog });
  const closeDelete = () => setDeleteModal({ open: false, blog: null });

  const confirmDelete = async () => {
    if (!deleteModal.blog) return;
    setDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/blogs/${deleteModal.blog.id}`);
      setBlogs(prev => prev.filter(b => b.id !== deleteModal.blog.id));
      closeDelete();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };

  const toggleDropdown = (id) => setOpenDropdown(prev => prev === id ? null : id);

  // ── Status badge ──────────────────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const cfg = {
      published: { cls: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400", dot: "bg-green-500", label: "Published" },
      draft:     { cls: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",  dot: "bg-amber-500", label: "Draft" },
      inactive:  { cls: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",         dot: "bg-gray-400", label: "Inactive" },
    };
    const s = cfg[status] ?? cfg.inactive;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} /> {s.label}
      </span>
    );
  };

  const CATEGORIES = ['news','state','industry','region','infrastructure','energy','chemical','ports'];
  const TYPES      = ['top_projects','tracker','analysis','general'];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Blogs List</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your blog posts and articles.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/addBlog'}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Blog
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 gap-3 flex-wrap">
            {/* Search */}
            <div className="relative w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Quick search…"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-2 relative" ref={filterRef}>
              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {filterTitle && (
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-full">
                      Title: {filterTitle}
                      <button onClick={() => setFilterTitle('')} className="hover:text-blue-900 font-bold">×</button>
                    </span>
                  )}
                  {filterCategory && (
                    <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-1 rounded-full">
                      Category: {filterCategory}
                      <button onClick={() => setFilterCategory('')} className="hover:text-purple-900 font-bold">×</button>
                    </span>
                  )}
                  {filterType && (
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded-full">
                      Type: {filterType}
                      <button onClick={() => setFilterType('')} className="hover:text-amber-900 font-bold">×</button>
                    </span>
                  )}
                  {filterStatus && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-full">
                      Status: {filterStatus}
                      <button onClick={() => setFilterStatus('')} className="hover:text-green-900 font-bold">×</button>
                    </span>
                  )}
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium px-1">Clear all</button>
                </div>
              )}

              {/* Filter button */}
              <button onClick={() => setFilterOpen(prev => !prev)}
                className={`relative flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition
                  ${filterOpen || activeFilterCount > 0
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" />
                </svg>
                Filter
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Filter dropdown */}
              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white border border-gray-200 shadow-xl z-30 p-5 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">Filter Blogs</p>
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear all</button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Blog Title</label>
                      <input type="text" value={filterTitle} onChange={e => setFilterTitle(e.target.value)} placeholder="Search title…"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                    </div>
                    {/* Category */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                      <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                        <option value="">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                    </div>
                    {/* Blog Type */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Blog Type</label>
                      <select value={filterType} onChange={e => setFilterType(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                        <option value="">All Types</option>
                        {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                      </select>
                    </div>
                    {/* Status */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                      <div className="flex gap-2">
                        {['', 'published', 'draft', 'inactive'].map(val => (
                          <button key={val} onClick={() => setFilterStatus(val)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition
                              ${filterStatus === val
                                ? val === 'published' ? 'bg-green-500 border-green-500 text-white'
                                : val === 'draft'     ? 'bg-amber-500 border-amber-500 text-white'
                                : val === 'inactive'  ? 'bg-gray-500 border-gray-500 text-white'
                                :                       'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                            {val === '' ? 'All' : val.charAt(0).toUpperCase() + val.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setFilterOpen(false)}
                    className="mt-5 w-full py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">
                    Apply Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
              <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading blogs...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="px-5 py-3 w-10">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </th>
                    {['Blog', 'Category', 'Type', 'Author', 'Date', 'Status', 'Action'].map((h, i) => (
                      <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {filteredBlogs.length > 0 ? filteredBlogs.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-700/40">

                      {/* Checkbox */}
                      <td className="px-5 py-4 align-middle">
                        <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleOne(item.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                      </td>

                      {/* Blog title + image */}
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {item.featured_image ? (
                              <img src={`${import.meta.env.VITE_SERVER_URL}/storage/${item.featured_image}`} alt={item.title}
                                className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
                                <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
                                <polyline points="21 15 16 10 5 21" strokeWidth="1.5" />
                              </svg>
                            )}
                          </div>
                          <div className="flex flex-col max-w-[260px]">
                            <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight line-clamp-2">{item.title}</p>
                            <p className="text-[11px] text-gray-400 mt-1 font-mono truncate">/blogs/{item.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 align-middle">
                        <span className="text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded-full capitalize">
                          {item.category ?? '—'}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4 align-middle">
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">
                          {item.blog_type?.replace('_', ' ') ?? '—'}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="px-5 py-4 align-middle text-xs text-gray-500 dark:text-gray-400">
                        {item.author ?? 'New Projects Tracker'}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 align-middle text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {item.published_at
                          ? new Date(item.published_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : item.created_at
                          ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 align-middle">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Action Dropdown */}
                      <td className="px-5 py-4 align-middle relative">
                        <div className="relative inline-block text-left">
                          <button onClick={() => toggleDropdown(item.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                            </svg>
                          </button>
                          {openDropdown === item.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                              <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white border border-gray-100 shadow-lg z-20 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                                <button  onClick={() => { 
  setOpenDropdown(null); 
  navigate(`/editBlog/${item.id}`);
}}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  Edit
                                </button>
                                <a href={`${import.meta.env.VITE_SERVER_URL}/blogs/news/${item.slug}`} target="_blank" rel="noreferrer"
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  Preview
                                </a>
                                <button onClick={() => { setOpenDropdown(null); openDelete(item); }}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="8" className="py-16 text-center text-gray-400 text-sm">No blogs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination footer */}
          {!loading && filteredBlogs.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredBlogs.length}</span> of{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300">{blogs.length}</span> blogs
              </p>
              <div className="flex items-center gap-1">
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">Previous</button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white border border-blue-600">1</button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">Next</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
              </svg>
            </div>
            <h3 className="text-center text-lg font-semibold text-gray-800 dark:text-white mb-1">Delete Blog</h3>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">"{deleteModal.blog?.title}"</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={closeDelete} disabled={deleting}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-60">
                {deleting && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBlogs;