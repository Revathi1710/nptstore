import axios from 'axios';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../component/Sidebar';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

// Public store URL used for the "open product" link on the product name
const STORE_URL = import.meta.env.VITE_STORE_URL || 'https://nptstore.in';

// ─── Icons ────────────────────────────────────────────────────────────────────
const ExcelIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18" />
  </svg>
);

const PdfIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M8 15h1.5a1.5 1.5 0 0 0 0-3H8v5M13 17v-5h1.2a2.5 2.5 0 0 1 0 5H13" strokeWidth="1.3" />
  </svg>
);

// Returns a URL that opens the PDF in a new tab, or null if the product has none.
// Uses the URL from the API resource; falls back to the download route.
const getPdfUrl = (item, type) => {
  const f = item[`pdf_${type}`];
  if (!f) return null;
  return f.url ?? f.download_url ?? `${import.meta.env.VITE_API_URL}/products/${item.id}/download-pdf/${type}`;
};

const PdfLink = ({ item, type }) => {
  const url = getPdfUrl(item, type);
  if (!url) return <span className="text-xs text-gray-300">—</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={`Open ${type} PDF`}
      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
    >
      <PdfIcon /> {type === 'full' ? 'Full PDF' : 'Sample PDF'}
    </a>
  );
};

// ─── Filter config ────────────────────────────────────────────────────────────
const EMPTY_FILTERS = {
  name: '', code: '', publishedIn: '',
  state: [], segment: [], industry: [], year: [],   // multi-select -> arrays
  status: '', excel: '',
};

// Chips shown next to the Filter button for every active filter
const CHIPS = [
  { key: 'name',        label: 'Name',      color: 'blue' },
  { key: 'code',        label: 'Code',      color: 'purple' },
  { key: 'publishedIn', label: 'Published', color: 'amber' },
  { key: 'state',       label: 'State',     color: 'indigo' },
  { key: 'segment',     label: 'Segment',   color: 'pink' },
  { key: 'industry',    label: 'Industry',  color: 'cyan' },
  { key: 'year',        label: 'Year',      color: 'orange' },
  { key: 'status',      label: 'Status',    color: 'green' },
  { key: 'excel',       label: 'Excel',     color: 'emerald', fmt: (v) => (v === 'yes' ? 'Has file' : 'No file') },
];

// Tailwind needs full class names (no dynamic strings), so they are listed here
const CHIP_COLORS = {
  blue:    'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  purple:  'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  amber:   'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  indigo:  'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  pink:    'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
  cyan:    'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
  orange:  'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  green:   'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
};

const LABEL_CLS = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 dark:text-gray-400';
const INPUT_CLS = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400';

// Unique, non-empty values of one product field (for the dropdowns)
const uniqueValues = (products, key) => {
  const vals = [...new Set(
    products
      .map((p) => p[key])
      .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
      .map((v) => String(v).trim())
  )];
  return key === 'year'
    ? vals.sort((a, b) => Number(b) - Number(a))   // newest year first
    : vals.sort((a, b) => a.localeCompare(b));
};

// Multi-select with checkboxes. Defined OUTSIDE AllProduct so it keeps its open/search state across re-renders.
const MultiSelect = ({ label, options, selected, onChange, placeholder }) => {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');

  const visible = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));
  const toggle  = (v) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  const summary =
    selected.length === 0 ? placeholder
    : selected.length <= 2 ? selected.join(', ')
    : `${selected.length} selected`;

  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${INPUT_CLS} flex items-center justify-between text-left`}
      >
        <span className={`truncate ${selected.length ? 'font-medium' : 'text-gray-500 dark:text-gray-400'}`}>{summary}</span>
        <svg className={`w-4 h-4 flex-none text-gray-400 transition ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-1.5 rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-600">
          <div className="flex items-center gap-2 border-b border-gray-100 p-2 dark:border-gray-700">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
            {selected.length > 0 && (
              <button type="button" onClick={() => onChange([])} className="flex-none text-xs font-medium text-red-500 hover:text-red-700">
                Clear
              </button>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {visible.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-400">No options</p>
            ) : visible.map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  checked={selected.includes(o)}
                  onChange={() => toggle(o)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {o}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AllProduct = () => {
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [deleteModal, setDeleteModal]   = useState({ open: false, product: null });
  const [deleting, setDeleting]         = useState(false);
  const [selectedIds, setSelectedIds]   = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters]       = useState(EMPTY_FILTERS);
  const filterRef = useRef(null);
  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  // ── Pagination state (initialised from the URL: ?page=2&per_page=10) ──────
  const [currentPage, setCurrentPage]   = useState(Number(searchParams.get('page')) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(Number(searchParams.get('per_page')) || 10);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/products?per_page=1000&sort_by=created_at&sort_dir=desc`
      );
      setProducts(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // Close filter panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset page to 1 only when the search/filters actually change (not on first mount,
  // otherwise the page restored from the URL would be overwritten).
  const filterKey = [search, ...Object.values(filters)].join('|');
  const prevFilterKey = useRef(filterKey);

  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      setCurrentPage(1);
    }
  }, [filterKey]);

  // Keep the URL in sync with the current page
  useEffect(() => {
    setSearchParams({ page: currentPage, per_page: itemsPerPage }, { replace: true });
  }, [currentPage, itemsPerPage]);

  // ── Dropdown options (built from the loaded products) ─────────────────────
  const options = useMemo(() => ({
    state:    uniqueValues(products, 'state'),
    segment:  uniqueValues(products, 'segment'),
    industry: uniqueValues(products, 'industry'),
    year:     uniqueValues(products, 'year'),
  }), [products]);

  // ── Newest first (descending by id) ───────────────────────────────────────
  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => Number(b.id) - Number(a.id)),
    [products]
  );

  // ── Filtering ─────────────────────────────────────────────────────────────
  const activeFilterCount = Object.values(filters).filter((v) => (Array.isArray(v) ? v.length > 0 : Boolean(v))).length;
  const hasAnyFilter = activeFilterCount > 0 || search.trim() !== '';

  const filteredProducts = sortedProducts.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.name?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q);

    const matchName        = !filters.name        || p.name?.toLowerCase().includes(filters.name.toLowerCase());
    const matchCode        = !filters.code        || p.code?.toLowerCase().includes(filters.code.toLowerCase());
    const matchPublishedIn = !filters.publishedIn || String(p.published_in ?? '').toLowerCase().includes(filters.publishedIn.toLowerCase());
    const matchState       = !filters.state.length    || filters.state.includes(String(p.state ?? '').trim());
    const matchSegment     = !filters.segment.length  || filters.segment.includes(String(p.segment ?? '').trim());
    const matchIndustry    = !filters.industry.length || filters.industry.includes(String(p.industry ?? '').trim());
    const matchYear        = !filters.year.length     || filters.year.includes(String(p.year ?? '').trim());
    const matchStatus      = !filters.status      || p.status === filters.status;
    const matchExcel       = !filters.excel       ||
      (filters.excel === 'yes' ? !!p.excel_file : !p.excel_file);

    return matchSearch && matchName && matchCode && matchPublishedIn &&
           matchState && matchSegment && matchIndustry && matchYear &&
           matchStatus && matchExcel;
  });

  // ── Pagination Calculation ────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // If the restored page no longer exists (e.g. products were deleted), fall back to the last page
  useEffect(() => {
    if (!loading && totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [loading, totalPages, currentPage]);

  // Clears every filter AND the quick search
  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearch('');
  };

  // ── Select all ────────────────────────────────────────────────────────────
  const allSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.includes(p.id));
  const toggleAll   = () => {
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !paginatedProducts.some(p => p.id === id)));
    } else {
      const currentPageIds = paginatedProducts.map(p => p.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };
  const toggleOne   = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const openDelete  = (product) => setDeleteModal({ open: true, product });
  const closeDelete = () => setDeleteModal({ open: false, product: null });

  const confirmDelete = async () => {
    if (!deleteModal.product) return;
    setDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${deleteModal.product.id}`);
      setProducts(prev => prev.filter(p => p.id !== deleteModal.product.id));
      closeDelete();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };

  const toggleDropdown = (id) => setOpenDropdown(prev => prev === id ? null : id);

  // ── Excel download ────────────────────────────────────────────────────────
  const downloadExcel = async (product) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/${product.id}/download-excel`,
        { responseType: 'blob' }
      );
      const url      = window.URL.createObjectURL(new Blob([response.data]));
      const link     = document.createElement('a');
      link.href      = url;
      link.download  = product.excel_file?.original_name ?? `${product.code}-data.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download Excel file.');
    }
  };

  // One chip per selected value (multi-select filters give several chips)
  const activeChips = CHIPS.flatMap((c) => {
    const v = filters[c.key];
    if (Array.isArray(v)) return v.map((x) => ({ ...c, value: x, display: x }));
    return v ? [{ ...c, value: v, display: c.fmt ? c.fmt(v) : v }] : [];
  });

  const removeChip = (chip) => {
    const v = filters[chip.key];
    setFilter(chip.key, Array.isArray(v) ? v.filter((x) => x !== chip.value) : '');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Products List</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track your store's progress to boost your sales.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/admin/addProduct'}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
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
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Quick search..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-2 relative flex-wrap" ref={filterRef}>
              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeChips.map((c) => (
                    <span
                      key={`${c.key}:${c.value}`}
                      className={`inline-flex items-center gap-1 text-xs border px-2 py-1 rounded-full ${CHIP_COLORS[c.color]}`}
                    >
                      {c.label}: {c.display}
                      <button onClick={() => removeChip(c)} className="font-bold hover:opacity-70">×</button>
                    </span>
                  ))}
                </div>
              )}

              {/* Clear filters button (always visible when something is applied) */}
              {hasAnyFilter && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear filters
                </button>
              )}

              {/* Filter button */}
              <button
                onClick={() => setFilterOpen(prev => !prev)}
                className={`relative flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition
                  ${filterOpen || activeFilterCount > 0
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'}`}
              >
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

              {/* Filter dropdown panel */}
              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 max-h-[75vh] overflow-y-auto rounded-2xl bg-white border border-gray-200 shadow-xl z-30 p-5 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">Filter Products</p>
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium">
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Multi-select filters: tick as many as you need */}
                    <MultiSelect label="State"    options={options.state}    selected={filters.state}    onChange={(v) => setFilter('state', v)}    placeholder="All states" />
                    <MultiSelect label="Segment"  options={options.segment}  selected={filters.segment}  onChange={(v) => setFilter('segment', v)}  placeholder="All segments" />
                    <MultiSelect label="Industry" options={options.industry} selected={filters.industry} onChange={(v) => setFilter('industry', v)} placeholder="All industries" />
                    <MultiSelect label="Year"     options={options.year}     selected={filters.year}     onChange={(v) => setFilter('year', v)}     placeholder="All years" />

                    {/* Name */}
                    <div>
                      <label className={LABEL_CLS}>Product Name</label>
                      <input
                        type="text"
                        value={filters.name}
                        onChange={e => setFilter('name', e.target.value)}
                        placeholder="e.g. Andhra Pradesh..."
                        className={INPUT_CLS}
                      />
                    </div>

                    {/* Product Code */}
                    <div>
                      <label className={LABEL_CLS}>Product Code</label>
                      <input
                        type="text"
                        value={filters.code}
                        onChange={e => setFilter('code', e.target.value)}
                        placeholder="e.g. NPT-0009"
                        className={INPUT_CLS}
                      />
                    </div>

                    {/* Published In */}
                    <div>
                      <label className={LABEL_CLS}>Published In</label>
                      <input
                        type="text"
                        value={filters.publishedIn}
                        onChange={e => setFilter('publishedIn', e.target.value)}
                        placeholder="e.g. 2026 or June 2026"
                        className={INPUT_CLS}
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className={LABEL_CLS}>Status</label>
                      <div className="flex gap-2">
                        {['', 'active', 'inactive'].map(val => (
                          <button
                            key={val}
                            onClick={() => setFilter('status', val)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition
                              ${filters.status === val
                                ? val === 'active'   ? 'bg-green-500 border-green-500 text-white'
                                : val === 'inactive' ? 'bg-gray-500 border-gray-500 text-white'
                                :                      'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                          >
                            {val === '' ? 'All' : val.charAt(0).toUpperCase() + val.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Excel file */}
                    <div>
                      <label className={LABEL_CLS}>Excel File</label>
                      <div className="flex gap-2">
                        {[{ v: '', label: 'All' }, { v: 'yes', label: 'Has File' }, { v: 'no', label: 'No File' }].map(opt => (
                          <button
                            key={opt.v}
                            onClick={() => setFilter('excel', opt.v)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition
                              ${filters.excel === opt.v
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={clearFilters}
                      className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setFilterOpen(false)}
                      className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Apply Filters
                    </button>
                  </div>
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
              Loading products...
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
                    {['Product', 'Code', 'Price', 'Stock', 'Excel', 'PDF Full', 'PDF Sample', 'Action'].map((h, i) => (
                      <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {paginatedProducts.length > 0 ? paginatedProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-700/40">

                      {/* Checkbox */}
                      <td className="px-5 py-4 align-middle">
                        <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleOne(item.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                      </td>

                      {/* Product Name + Image (name opens the live product page in a new tab) */}
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {item.images && item.images.length > 0 ? (
                              <img src={`${import.meta.env.VITE_SERVER_URL}/storage/${item.images[0].path}`} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /></svg>
                            )}
                          </div>
                          <div className="flex flex-col">
                            {item.slug ? (
                              <a
                                href={`${STORE_URL}/report/${item.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Open product page"
                                className="text-sm font-semibold text-gray-800 hover:text-blue-600 hover:underline dark:text-white dark:hover:text-blue-400 leading-tight"
                              >
                                {item.name}
                              </a>
                            ) : (
                              <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">{item.name}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">{item.format ?? '—'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Code & Published In */}
                      <td className="px-5 py-4 align-middle">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded w-fit">
                            {item.code}
                          </span>
                          <span className="text-[11px] text-gray-400 italic ml-0.5">
                            {item.published_in || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4 align-middle text-sm font-medium text-gray-800 dark:text-white">
                        ₹{parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Stock Status */}
                      <td className="px-5 py-4 align-middle">
                        {item.quantity > 0 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Out of Stock
                          </span>
                        )}
                      </td>

                      {/* Excel Download */}
                      <td className="px-5 py-4 align-middle">
                        {item.excel_file ? (
                          <button onClick={() => downloadExcel(item)} className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-2.5 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 transition dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                            <ExcelIcon /> Download
                          </button>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>

                      {/* PDF Full — opens in a new tab */}
                      <td className="px-5 py-4 align-middle">
                        <PdfLink item={item} type="full" />
                      </td>

                      {/* PDF Sample — opens in a new tab */}
                      <td className="px-5 py-4 align-middle">
                        <PdfLink item={item} type="sample" />
                      </td>

                      {/* Action Dropdown */}
                      <td className="px-5 py-4 align-middle relative">
                        <div className="relative inline-block text-left">
                          <button onClick={() => toggleDropdown(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
                          </button>
                          {openDropdown === item.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                              <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white border border-gray-100 shadow-lg z-20 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                                <button onClick={() => {
                                  setOpenDropdown(null);
                                  // pass the current URL (with ?page=N) so Edit can return to the same page
                                  navigate(`/editProduct/${item.id}`, {
                                    state: { from: `${location.pathname}${location.search}` },
                                  });
                                }}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                  Edit
                                </button>
                                <button onClick={() => { setOpenDropdown(null); openDelete(item); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" /></svg>
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
                      <td colSpan="9" className="py-16 text-center text-gray-400 text-sm">
                        No products found.
                        {hasAnyFilter && (
                          <button onClick={clearFilters} className="ml-2 font-medium text-blue-600 hover:underline">
                            Clear filters
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination footer */}
          {!loading && filteredProducts.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
                  </span>{' '}
                  of <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredProducts.length}</span> products
                </p>

                {/* Items per page selector */}
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>Per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Page Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-500 border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Next
                </button>
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
            <h3 className="text-center text-lg font-semibold text-gray-800 dark:text-white mb-1">Delete Product</h3>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">"{deleteModal.product?.name}"</span>?
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

export default AllProduct;