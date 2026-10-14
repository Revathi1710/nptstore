import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  FiSearch, FiChevronLeft, FiChevronRight, FiPhone, FiMail,
  FiBriefcase, FiExternalLink, FiCheckCircle, FiUserPlus, FiDownload,
  FiTrash2, FiAlertTriangle, FiX,
} from 'react-icons/fi';
import Sidebar from '../component/Sidebar';

const API = import.meta.env.VITE_API_URL;

const TABS = [
  { key: 'all',        label: 'All' },
  { key: 'registered', label: 'Registered users' },
  { key: 'new',        label: 'New users' },
];

const TH = 'px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] whitespace-nowrap';

const avatarColor = (name = '') => {
  const colors = [
    'bg-violet-100 text-violet-600', 'bg-sky-100 text-sky-600', 'bg-emerald-100 text-emerald-600',
    'bg-rose-100 text-rose-600', 'bg-amber-100 text-amber-600', 'bg-indigo-100 text-indigo-600',
  ];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

// Product page route used by your store. Change if your detail route differs.
const productUrl = (p) => `/product/${p.slug}`;

const CLOSED_MODAL = { open: false, ids: [], label: '' };

const DownloadSampleUser = () => {
  const [rows, setRows]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [debounced, setDebounced]     = useState('');
  const [account, setAccount]         = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage]       = useState(1);
  const [totalItems, setTotalItems]   = useState(0);
  const [perPage, setPerPage]         = useState(15);

  // Selection + delete
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState(CLOSED_MODAL);
  const [deleting, setDeleting]       = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [reload, setReload]           = useState(0);   // bump to refetch the current page

  // Debounce the search box, go back to page 1 and clear the selection when it changes
  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setCurrentPage(1); setSelectedIds([]); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get(`${API}/sample-requests`, {
          params: { page: currentPage, search: debounced, account },
        });
        if (!alive) return;
        setRows(data.data);
        setLastPage(data.meta.last_page);
        setTotalItems(data.meta.total);
        setPerPage(data.meta.per_page);
      } catch (err) {
        console.error('Error fetching sample requests:', err);
        if (alive) setError('Could not load sample requests. Please try again.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [currentPage, debounced, account, reload]);

  const changeAccount = (key) => { setAccount(key); setCurrentPage(1); setSelectedIds([]); };

  // ── Selection ─────────────────────────────────────────────────────────────
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !rows.some((r) => r.id === id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...rows.map((r) => r.id)])));
    }
  };
  const toggleOne = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // ── Delete ────────────────────────────────────────────────────────────────
  const openDeleteOne  = (r) => { setDeleteError(''); setDeleteModal({ open: true, ids: [r.id], label: `${r.name} (${r.email})` }); };
  const openDeleteMany = () => { setDeleteError(''); setDeleteModal({ open: true, ids: selectedIds, label: '' }); };
  const closeDelete    = () => { if (!deleting) setDeleteModal(CLOSED_MODAL); };

  const confirmDelete = async () => {
    const ids = deleteModal.ids;
    if (ids.length === 0) return;
    setDeleting(true);
    setDeleteError('');
    try {
      if (ids.length === 1) {
        await axios.delete(`${API}/sample-requests/${ids[0]}`);
      } else {
        await axios.post(`${API}/sample-requests/bulk-delete`, { ids });
      }

      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
      setDeleteModal(CLOSED_MODAL);

      // If this deleted everything on the current page, step back one page; otherwise just refetch
      const removedOnPage = rows.filter((r) => ids.includes(r.id)).length;
      if (removedOnPage >= rows.length && currentPage > 1) setCurrentPage((p) => p - 1);
      else setReload((n) => n + 1);
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleteError(err.response?.data?.message || 'Could not delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const bulk = deleteModal.ids.length > 1;

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Sample Downloads</h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {totalItems.toLocaleString()} sample request{totalItems === 1 ? '' : 's'}
              </p>
            </div>

            <div className="relative w-full lg:w-80">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, company, report…"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Filter tabs + bulk action bar */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => changeAccount(t.key)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                    account === t.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5">
                <span className="text-xs font-bold text-indigo-700">{selectedIds.length} selected</span>
                <button
                  onClick={openDeleteMany}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-700"
                >
                  <FiTrash2 size={13} /> Delete selected
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        disabled={rows.length === 0}
                        aria-label="Select all on this page"
                        className="cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className={`${TH} w-14`}>S.No</th>
                    <th className={TH}>Lead</th>
                    <th className={TH}>Company</th>
                    <th className={TH}>Report</th>
                    <th className={TH}>Account</th>
                    <th className={TH}>Requested</th>

                    <th className={`${TH} text-center`}>Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="py-24">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-bold text-slate-400">Loading requests…</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr><td colSpan="9" className="py-24 text-center text-sm font-bold text-rose-500">{error}</td></tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-24 text-center">
                        <FiDownload size={30} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-sm font-bold text-slate-400">
                          {debounced || account !== 'all' ? 'No requests match your filters' : 'No sample requests yet'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, i) => (
                      <tr
                        key={r.id}
                        className={`align-top transition-colors hover:bg-slate-50/70 ${selectedIds.includes(r.id) ? 'bg-indigo-50/40' : ''}`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(r.id)}
                            onChange={() => toggleOne(r.id)}
                            aria-label={`Select ${r.name}`}
                            className="cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>

                        {/* S.No */}
                        <td className="px-4 py-4 text-sm font-bold text-slate-400">
                          {(currentPage - 1) * perPage + i + 1}
                        </td>

                        {/* Lead: name, email, mobile stacked */}
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl flex shrink-0 items-center justify-center font-black text-xs ${avatarColor(r.name)}`}>
                              {r.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800">{r.name}</p>
                              <a href={`mailto:${r.email}`} className="mt-0.5 flex items-center gap-1 break-all text-[11px] font-medium text-slate-500 hover:text-indigo-600">
                                <FiMail size={11} className="shrink-0" />{r.email}
                              </a>
                              <a href={`tel:${r.mobile}`} className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600">
                                <FiPhone size={11} className="shrink-0" />{r.mobile}
                              </a>
                            </div>
                          </div>
                        </td>

                        {/* Company */}
                        <td className="px-4 py-4">
                          <span className="flex items-start gap-1.5 text-sm font-medium text-slate-600">
                            <FiBriefcase size={12} className="mt-1 shrink-0 text-slate-400" />
                            <span className="break-words">{r.company || '—'}</span>
                          </span>
                        </td>

                        {/* Report: opens the product page in a new tab */}
                        <td className="px-4 py-4 max-w-[240px]">
                          {r.product ? (
                            <a
                              href={productUrl(r.product)}
                              target="_blank"
                              rel="noreferrer"
                              title="Open this report in a new tab"
                              className="group block"
                            >
                              <span className="flex items-start gap-1.5 text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                                <span className="line-clamp-2">{r.product.name}</span>
                                <FiExternalLink size={12} className="mt-0.5 shrink-0 text-slate-400 group-hover:text-indigo-600" />
                              </span>
                              {r.product.code && (
                                <span className="font-mono text-[10px] font-bold text-slate-400">{r.product.code}</span>
                              )}
                            </a>
                          ) : (
                            <span className="text-xs italic text-slate-300">Report deleted</span>
                          )}
                        </td>

                        {/* Registered or new user */}
                        <td className="px-4 py-4">
                          {r.is_registered ? (
                            <span
                              title={`Registered as ${r.user?.name}`}
                              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600"
                            >
                              <FiCheckCircle size={12} /> Registered
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-600">
                              <FiUserPlus size={12} /> New user
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className="text-xs font-semibold text-slate-700">{fmtDate(r.created_at)}</p>
                          <p className="text-[11px] text-slate-400">{fmtTime(r.created_at)}</p>
                        </td>

                        {/* Email status
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            r.sent_at
                              ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
                              : 'border border-amber-100 bg-amber-50 text-amber-600'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${r.sent_at ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {r.sent_at ? 'Sent' : 'Not sent'}
                          </span>
                        </td> */}

                        {/* Delete this one */}
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => openDeleteOne(r)}
                            title="Delete this request"
                            aria-label={`Delete ${r.name}`}
                            className="rounded-lg border border-rose-100 bg-rose-50 p-2 text-rose-500 transition hover:bg-rose-100 hover:text-rose-700"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <p className="text-xs font-semibold text-slate-500">
                Showing <span className="font-black text-slate-900">{rows.length}</span> of {totalItems}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="rounded-lg border border-slate-200 bg-white p-2 transition hover:bg-slate-50 disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <FiChevronLeft />
                </button>
                <span className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 whitespace-nowrap">
                  Page {currentPage} of {lastPage}
                </span>
                <button
                  disabled={currentPage >= lastPage}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 bg-white p-2 transition hover:bg-slate-50 disabled:opacity-30"
                  aria-label="Next page"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete confirmation modal (single + bulk) */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={closeDelete}
              disabled={deleting}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
              aria-label="Close"
            >
              <FiX size={18} />
            </button>

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
              <FiAlertTriangle size={22} className="text-rose-600" />
            </div>
            <h3 className="mb-1 text-center text-lg font-bold text-slate-800">
              {bulk ? `Delete ${deleteModal.ids.length} requests?` : 'Delete request?'}
            </h3>
            <p className="mb-5 text-center text-sm text-slate-500">
              {bulk
                ? <>The <span className="font-semibold text-slate-700">{deleteModal.ids.length} selected</span> sample requests will be removed permanently.</>
                : <>The request from <span className="font-semibold text-slate-700 break-all">{deleteModal.label}</span> will be removed permanently.</>}
              {' '}This cannot be undone.
            </p>

            {deleteError && (
              <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-center text-xs font-semibold text-rose-600">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeDelete}
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadSampleUser;