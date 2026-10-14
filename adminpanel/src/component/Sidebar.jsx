import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from "../assets/logo.avif";

/* ─── Refined Icon Set ─── */
const Icon = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Orders: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Blog: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z" />
    </svg>
  ),
  Product: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Chevron: ({ open }) => (
    <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
    </svg>
  ),
};

const menuGroups = [
  {
    title: "General",
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <Icon.Dashboard /> },
      {
        label: 'Orders', icon: <Icon.Orders />, 
        children: [{ label: 'All Orders', href: '/orders' }],
      },
      { label: 'Users', href: '/allUser', icon: <Icon.Users /> },
      { label: 'Sample Request', href: '/sample-request', icon: <Icon.Orders /> },
     
      {
        label: 'Products', icon: <Icon.Product />, 
        children: [
          { label: 'All Products', href: '/allProduct' },
          { label: 'Add Product', href: '/addProduct' },
        ],
      },
      {
        label: 'Blogs', icon: <Icon.Blog />, 
        children: [
          { label: 'All Blogs', href: '/blogs' },
          { label: 'Add Blog', href: '/addBlog' },
        ],
      },
    ]
  },
  {
    title: "Account & System",
    items: [
      {
        label: 'Security', icon: <Icon.Lock />, 
        children: [{ label: 'Change Password', href: '/settings/password' }],
      },
    ]
  }
];

const NavItem = ({ item, currentPath, openMenus, toggle }) => {
  const hasChildren = item.children?.length > 0;
  const isOpen = !!openMenus[item.label];
  const isActive = item.href === currentPath || item.children?.some(c => c.href === currentPath);

  const baseStyles = "group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-1.5 relative";
  const activeStyles = "bg-indigo-600/5 text-indigo-600";
  const inactiveStyles = "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80";

  return (
    <div className="mb-1">
      {item.href && !hasChildren ? (
        <Link to={item.href} className={`${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}>
          {isActive && <div className="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full" />}
          <span className={`${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{item.icon}</span>
          <span className="flex-1">{item.label}</span>
        </Link>
      ) : (
        <button onClick={() => toggle(item.label)} className={`w-full ${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}>
          <span className={`${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{item.icon}</span>
          <span className="flex-1 text-left">{item.label}</span>
          <Icon.Chevron open={isOpen} />
        </button>
      )}

      {hasChildren && isOpen && (
        <div className="ml-9 border-l border-slate-200 mt-1 space-y-1">
          {item.children.map((child) => {
            const isChildActive = currentPath === child.href;
            return (
              <Link
                key={child.label}
                to={child.href}
                className={`block pl-4 py-2 text-[13px] font-medium transition-all relative ${
                  isChildActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {isChildActive && <div className="absolute left-[-1px] w-[1px] h-full bg-indigo-600" />}
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [openMenus, setOpenMenus] = useState({});
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("admin_user");
    if (storedUser) {
        try { setAdmin(JSON.parse(storedUser)); } catch (e) { console.error(e); }
    }
    const defaults = {};
    menuGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.children?.some(c => c.href === currentPath)) defaults[item.label] = true;
      });
    });
    setOpenMenus(prev => ({ ...prev, ...defaults }));
  }, [currentPath]);

  const toggle = (label) => setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/");
  };

  return (
    <aside className="w-[280px] bg-white h-screen flex flex-col border-r border-slate-200 selection:bg-indigo-100">
      {/* ── Brand Header ── */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-lg shadow-indigo-200">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden">
                <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900 tracking-tight leading-tight">NPT Store</span>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.1em]">Management Hub</span>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-4 scrollbar-hide">
        {menuGroups.map((group, idx) => (
          <div key={group.title} className={idx !== 0 ? "mt-8" : ""}>
            <h3 className="px-4 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
              {group.title}
            </h3>
            {group.items.map(item => (
              <NavItem key={item.label} item={item} currentPath={currentPath} openMenus={openMenus} toggle={toggle} />
            ))}
          </div>
        ))}
      </nav>

      {/* ── Footer / User Profile ── */}
      <div className="p-4 mt-auto">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                {admin?.username?.substring(0, 1).toUpperCase() || "A"}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate leading-none mb-1">
              {admin?.username || "Admin User"}
            </p>
            <p className="text-[11px] font-medium text-slate-500 truncate capitalize">
              System Administrator
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Sign Out"
          >
            <Icon.Logout />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;