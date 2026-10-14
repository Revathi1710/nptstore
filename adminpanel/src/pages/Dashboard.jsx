import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FiShoppingBag, FiBox, FiEdit3, FiTrendingUp, 
  FiSearch, FiBell, FiMoreVertical, FiPlus,
  FiArrowUpRight, FiArrowDownRight, FiActivity
} from 'react-icons/fi';
import Sidebar from '../component/Sidebar';

const Dashboard = () => {
  const [data, setData] = useState({
    orders: [],
    totalOrders: 0,
    totalProducts: 0,
    totalBlogs: 0,
    revenue: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes, blogsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/orders`),
          axios.get(`${import.meta.env.VITE_API_URL}/products`),
          axios.get(`${import.meta.env.VITE_API_URL}/blogs`)
        ]);

        // Fix: Accessing the nested .data property from Laravel API Resources
        const orders = ordersRes.data.data || [];
        const productsCount = productsRes.data.meta?.total || productsRes.data.data?.length || 0;
        const blogsCount = blogsRes.data.data?.length || 0;
        
        const revenue = orders.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0);

        setData({
          orders: orders.slice(0, 5),
          totalOrders: ordersRes.data.meta?.total || orders.length,
          totalProducts: productsCount,
          totalBlogs: blogsCount,
          revenue,
          loading: false
        });
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchStats();
  }, []);

  if (data.loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Console</h1>
            <p className="text-xs text-slate-500 font-medium">Real-time store performance</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search command..." 
                className="w-72 bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <FiBell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <button className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm">
              <FiPlus strokeWidth={3} /> New Product
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Gross Revenue" 
              value={`₹${data.revenue.toLocaleString()}`} 
              trend="+12.5%" 
              icon={<FiTrendingUp className="text-blue-600" />}
              color="bg-blue-50"
            />
            <StatCard 
              label="Total Orders" 
              value={data.totalOrders} 
              trend="+4.2%" 
              icon={<FiShoppingBag className="text-emerald-600" />}
              color="bg-emerald-50"
            />
            <StatCard 
              label="Inventory" 
              value={data.totalProducts} 
              trend="Active" 
              icon={<FiBox className="text-amber-600" />}
              color="bg-amber-50"
            />
            <StatCard 
              label="Blog Posts" 
              value={data.totalBlogs} 
              trend="Active" 
              icon={<FiEdit3 className="text-purple-600" />}
              color="bg-purple-50"
            />
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Table Area */}
            <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Recent Transactions</h3>
                <button className="text-xs font-bold text-blue-600 hover:underline">EXPORT CSV</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.1em] text-slate-400 border-b border-slate-100">
                      <th className="px-6 py-4 font-bold">Customer Detail</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold">Total</th>
                      <th className="px-6 py-4 font-bold text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.orders.map((order) => (
                      <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">
                              {order.customer_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-700">{order.customer_name}</p>
                              <p className="text-[10px] font-mono text-slate-400">{order.razorpay_payment_id || 'OFFLINE'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-sm">₹{order.total}</td>
                        <td className="px-6 py-4 text-center">
                          <button className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                            <FiMoreVertical className="text-slate-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Sidebar Utility */}
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-xl shadow-blue-900/10">
                <div className="relative z-10">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Infrastructure</p>
                  <h4 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    99.9% <FiActivity className="text-emerald-400 text-sm animate-pulse" />
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>Sync Status</span>
                      <span className="text-blue-400">Stable</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full">
                      <div className="h-full w-[85%] bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-600/10 rounded-full blur-3xl"></div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-4">Quick Shortcuts</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Shortcut icon={<FiTrendingUp />} label="Reports" />
                  <Shortcut icon={<FiBox />} label="Stock" />
                  <Shortcut icon={<FiEdit3 />} label="Writing" />
                  <Shortcut icon={<FiShoppingBag />} label="Orders" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, trend, icon, color }) => (
  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
        <FiArrowUpRight /> {trend}
      </div>
    </div>
    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
  </div>
);

const Shortcut = ({ icon, label }) => (
  <button className="flex flex-col items-center justify-center py-4 px-2 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
    <span className="text-lg text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all mb-2">{icon}</span>
    <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900">{label}</span>
  </button>
);

export default Dashboard;