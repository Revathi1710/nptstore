import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { 
  FiSearch, FiFilter, FiEye, FiX, FiPackage, 
  FiChevronLeft, FiChevronRight, FiCreditCard, 
  FiMapPin, FiCalendar, FiDownload 
} from 'react-icons/fi';
import Sidebar from '../component/Sidebar';

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [totalItems, setTotalItems] = useState(0);

  const fetchOrders = async (page = 1, status = 'all') => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, {
        params: { page, status }
      });
      setOrders(response.data.data);
      setCurrentPage(response.data.meta.current_page);
      setLastPage(response.data.meta.last_page);
      setTotalItems(response.data.meta.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const filteredOrders = orders.filter(o => {
    const q = search.toLowerCase();
    return !q || o.customer_name?.toLowerCase().includes(q) || o.razorpay_payment_id?.toLowerCase().includes(q);
  });

  // Helper function to render status badges dynamically
  const renderStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {status}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {status}
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Order Management</h1>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                Total Volume: {totalItems.toLocaleString()} Transactions
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by customer or ID..."
                  className="pl-10 pr-4 py-2.5 w-64 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Status Filter Tab Group */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                {['all', 'paid', 'pending', 'failed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      statusFilter === status 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Table Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Customer Info</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Transaction Details</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-24">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Orders...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-16 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-5">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            #{String(order.id).padStart(4, '0')}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs border border-indigo-100">
                              {order.customer_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{order.customer_name}</p>
                              <p className="text-[11px] text-slate-400 font-medium">{order.customer_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">₹{parseFloat(order.total).toLocaleString('en-IN')}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                              {order.razorpay_payment_id || 'Cash/Offline'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {renderStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all"
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
                Displaying <span className="text-slate-900">{orders.length}</span> of {totalItems}
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

      {/* --- PREMIUM ORDER DETAILS MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>
          
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Order Invoice</h2>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded uppercase">
                    #{selectedOrder.id}
                  </span>
                  {renderStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                  <FiCalendar /> Transaction Date: {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-200/50 text-slate-400 rounded-full transition-colors">
                <FiX size={22} />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {/* Items Section */}
              <div className="space-y-3 mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Cart Contents</p>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img src={`${import.meta.env.VITE_SERVER_URL}/storage/${item.product.images[0].path}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><FiPackage size={20} /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-800">{item.product?.name || 'Item Information Missing'}</p>
                      <p className="text-[11px] text-slate-500 font-bold uppercase">Qty: {item.quantity} units</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">₹{(item.quantity * item.price).toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-slate-400">₹{parseFloat(item.price).toLocaleString()} / unit</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Shipment Destination</p>
                    <div className="flex gap-2">
                      <FiMapPin className="text-indigo-500 mt-1 shrink-0" />
                      <p className="text-[13px] font-bold text-slate-700 leading-relaxed">
                        {selectedOrder.customer_name}<br />
                        <span className="text-slate-500 font-medium">
                          {selectedOrder.address}, {selectedOrder.city}<br />
                          {selectedOrder.state} - {selectedOrder.pincode}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Financial Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Subtotal</span>
                      <span>₹{parseFloat(selectedOrder.subtotal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Tax (GST)</span>
                      <span>₹{parseFloat(selectedOrder.tax || 0).toLocaleString()}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-black text-slate-900 uppercase">Grand Total</span>
                      <span className="text-lg font-black text-indigo-600">₹{parseFloat(selectedOrder.total || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                <FiDownload /> PDF Invoice
              </button>
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-black transition-all uppercase tracking-widest">
                Close Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;