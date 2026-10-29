import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Award, User, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/results', label: 'Results', icon: Award },
  { to: '/student/profile', label: 'Profile', icon: User }
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-surface-muted">
      <aside className="w-64 shrink-0 border-r border-surface-border bg-surface flex flex-col">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-surface-border">
          <div className="rounded-lg bg-brand-600 p-1.5 text-white"><ShieldCheck size={18} /></div>
          <span className="font-extrabold text-ink-900 tracking-tight">SecureExam</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-surface-muted hover:text-ink-900'
              }`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-surface-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-900 truncate">{user?.name}</p>
              <p className="text-xs text-ink-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/student/login'); }}
            className="btn-ghost w-full mt-1 justify-start text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
