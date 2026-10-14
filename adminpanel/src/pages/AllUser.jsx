import axios from 'axios';
import React, { useEffect, useState } from 'react';

import {
  FiSearch, FiEye, FiX, FiPackage,
  FiChevronLeft, FiChevronRight,
  FiMapPin, FiPhone, FiMail, FiShoppingBag,
  FiUser, FiTrendingUp
} from 'react-icons/fi';
import Sidebar from '../component/Sidebar';

const AllUser = () => {
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const [lastPage, setLastPage]         = useState(1);
  const [totalItems, setTotalItems]     = useState(0);

  // Modal state
  const [selectedUser, setSelectedUser]   = useState(null);
  const [userOrders, setUserOrders]       = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // ── Fetch paginated users ────────────────────────────────────────
  const fetchUsers = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/all-users`, {
        params: { page, search: searchQuery }
      });
      setUsers(response.data.data);
      setCurrentPage(response.data.meta.current_page);
      setLastPage(response.data.meta.last_page);
      setTotalItems(response.data.meta.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers(currentPage, search);
  }, [currentPage]);

  // ── Open modal + fetch that user's orders ────────────────────────
  const openUserOrders = async (user) => {
    setSelectedUser(user);
    setUserOrders([]);
    setExpandedOrder(null);
    setOrdersLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/${user.id}/orders`
      );
      setUserOrders(res.data.orders || []);
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserOrders([]);
    setExpandedOrder(null);
  };

  // ── Helpers ──────────────────────────────────────────────────────
  const avatarColor = (name = '') => {
    const colors = [
      'bg-violet-100 text-violet-600 border-violet-200',
      'bg-sky-100 text-sky-600 border-sky-200',
      'bg-emerald-100 text-emerald-600 border-emerald-200',
      'bg-rose-100 text-rose-600 border-rose-200',
      'bg-amber-100 text-amber-600 border-amber-200',
      'bg-indigo-100 text-indigo-600 border-indigo-200',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* ── Sticky Header ── */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">User Management</h1>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                {totalItems.toLocaleString()} Registered Users
              </p>
            </div>

            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email or mobile..."
                className="pl-10 pr-4 py-2.5 w-72 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* ── Table Card ── */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">#</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">User</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Mobile</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Orders</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Total Spent</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Joined</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">View Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-24">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-24 text-center">
                        <FiUser size={32} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-sm font-bold text-slate-400">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-5">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            #{String(user.id).padStart(4, '0')}
                          </span>
                        </td>

                        {/* Name + Email */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${avatarColor(user.name)}`}>
                              {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{user.name}</p>
                              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                <FiMail size={10} /> {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Mobile */}
                        <td className="px-6 py-5">
                          <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                            <FiPhone size={12} className="text-slate-400" />
                            {user.mobile_number || <span className="text-slate-300 italic text-xs">—</span>}
                          </span>
                        </td>

                        {/* Order count */}
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100">
                            <FiShoppingBag size={10} />
                            {user.order_count ?? 0}
                          </span>
                        </td>

                        {/* Total spent */}
                        <td className="px-6 py-5">
                          <span className="text-sm font-black text-slate-800">
                            ₹{parseFloat(user.total_spent ?? 0).toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Joined date */}
                        <td className="px-6 py-5">
                          <span className="text-xs font-medium text-slate-500">
                            {new Date(user.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() => openUserOrders(user)}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all"
                            title="View orders"
                          >
                            <FiEye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Showing <span className="text-slate-900">{users.length}</span> of {totalItems}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
                >
                  <FiChevronLeft />
                </button>
                <div className="flex items-center px-4 py-2 rounded-lg bg-white border border-slate-200 text-[11px] font-black text-slate-700">
                  PAGE {currentPage} OF {lastPage}
                </div>
                <button
                  disabled={currentPage === lastPage}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── User Orders Modal ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={closeModal} />

          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border-2 ${avatarColor(selectedUser.name)}`}>
                  {selectedUser.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">{selectedUser.name}</h2>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <FiMail size={10} /> {selectedUser.email}
                    </span>
                    {selectedUser.mobile_number && (
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <FiPhone size={10} /> {selectedUser.mobile_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200/50 text-slate-400 rounded-full transition-colors mt-1">
                <FiX size={20} />
              </button>
            </div>

            {/* Stats strip */}
            <div className="flex divide-x divide-slate-100 bg-white border-b border-slate-100 flex-shrink-0">
              <div className="flex-1 px-6 py-3 flex items-center gap-2">
                <FiShoppingBag className="text-indigo-500" size={14} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Orders</p>
                  <p className="text-sm font-black text-slate-900">{userOrders.length}</p>
                </div>
              </div>
              <div className="flex-1 px-6 py-3 flex items-center gap-2">
                <FiTrendingUp className="text-emerald-500" size={14} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Spent</p>
                  <p className="text-sm font-black text-slate-900">
                    ₹{userOrders
                        .filter(o => o.status === 'paid')
                        .reduce((sum, o) => sum + parseFloat(o.total), 0)
                        .toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="flex-1 px-6 py-3 flex items-center gap-2">
                <FiUser className="text-violet-500" size={14} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Since</p>
                  <p className="text-sm font-black text-slate-900">
                    {new Date(selectedUser.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Orders list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {ordersLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Orders...</span>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <FiShoppingBag size={36} className="text-slate-200 mb-3" />
                  <p className="text-sm font-bold text-slate-400">No orders placed yet</p>
                </div>
              ) : (
                userOrders.map((order) => (
                  <div key={order.id} className="border border-slate-100 rounded-2xl overflow-hidden hover:border-indigo-100 transition-colors">
                    {/* Order row (always visible) */}
                    <button
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/60 transition-colors"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #{String(order.id).padStart(4, '0')}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            ₹{parseFloat(order.total).toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                            {order.razorpay_payment_id && (
                              <span className="ml-2 font-mono">{order.razorpay_payment_id}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          order.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {order.status}
                        </span>
                        <FiChevronRight
                          size={14}
                          className={`text-slate-400 transition-transform duration-200 ${expandedOrder === order.id ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </button>

                    {/* Expanded: items + address */}
                    {expandedOrder === order.id && (
                      <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/40 space-y-4">

                        {/* Items */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</p>
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100">
                              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0">
                                {item.product?.images?.[0] ? (
                                  <img
                                    src={`${import.meta.env.VITE_SERVER_URL}/storage/${item.product.images[0].path}`}
                                    className="w-full h-full object-cover"
                                    alt={item.product?.name}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <FiPackage size={16} />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{item.product?.name || 'Unknown Product'}</p>
                                <p className="text-[10px] text-slate-400">Qty: {item.quantity} × ₹{parseFloat(item.price).toLocaleString('en-IN')}</p>
                              </div>
                              <span className="text-xs font-black text-slate-900">
                                ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Address + Totals */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="bg-white rounded-xl border border-slate-100 p-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ship To</p>
                            <div className="flex gap-2">
                              <FiMapPin className="text-indigo-400 mt-0.5 shrink-0" size={12} />
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {order.address}, {order.city}<br />
                                {order.state} — {order.pincode}
                              </p>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl border border-slate-100 p-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Summary</p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                                <span>Subtotal</span>
                                <span>₹{parseFloat(order.subtotal).toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                                <span>Tax (GST)</span>
                                <span>₹{parseFloat(order.tax).toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-xs font-black text-slate-900 pt-1 border-t border-slate-100 mt-1">
                                <span>Total</span>
                                <span className="text-indigo-600">₹{parseFloat(order.total).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-slate-100 bg-white flex justify-end flex-shrink-0">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-black transition-all uppercase tracking-widest"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUser;