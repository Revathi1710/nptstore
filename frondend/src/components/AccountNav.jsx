import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { User, MapPin, ShoppingBag, LogOut } from 'lucide-react';
import { logout } from '../store/authSlice';
import { resetCartState } from '../store/cartSlice';

// Shared by MyAccount, MyOrder and Addresses. `active` is 'profile' | 'address' | 'orders'.
const ITEMS = [
  { id: 'profile', label: 'Profile', icon: User, to: '/myAccount' },
  { id: 'address', label: 'Address', icon: MapPin, to: '/addresses' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, to: '/my-orders' },
];

export default function AccountNav({ active }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    navigate('/login'); // leave first so no protected page redirects
    dispatch(logout());
    dispatch(resetCartState());
  };

  const base = 'flex shrink-0 items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm font-semibold transition lg:w-full';

  return (
    <nav aria-label="Account sections" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:gap-1 lg:overflow-visible lg:rounded-lg lg:border lg:border-slate-200 lg:bg-white lg:p-2 lg:pb-2">
      {ITEMS.map(({ id, label, icon: Icon, to }) => {
        const on = active === id;
        return (
          <Link
            key={id}
            to={to}
            aria-current={on ? 'page' : undefined}
            className={`${base} ${on ? 'bg-blue-700 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:text-blue-700 lg:border-transparent lg:bg-transparent lg:hover:bg-slate-50'}`}
          >
            <Icon size={17} /> {label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={handleLogout}
        className={`${base} border border-slate-200 bg-white text-slate-600 hover:text-rose-600 lg:mt-1 lg:border-transparent lg:border-t-slate-100 lg:bg-transparent lg:hover:bg-rose-50`}
      >
        <LogOut size={17} /> Sign out
      </button>
    </nav>
  );
}