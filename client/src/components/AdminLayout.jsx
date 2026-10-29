import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, HelpCircle, Award, Video, AlertTriangle,
  Settings, LogOut, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/exams', label: 'Exams', icon: FileText },
  { to: '/admin/questions', label: 'Questions', icon: HelpCircle },
  { to: '/admin/results', label: 'Results', icon: Award },
  { to: '/admin/monitoring', label: 'Live Monitoring', icon: Video },
  { to: '/admin/violations', label: 'Violations', icon: AlertTriangle },
  { to: '/admin/settings', label: 'Settings', icon: Settings }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-surface-muted">
      <aside className="w-64 shrink-0 border-r border-surface-border bg-ink-900 text-white flex flex-col">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
          <div className="rounded-lg bg-brand-500 p-1.5 text-white"><ShieldCheck size={18} /></div>
          <div>
            <p className="font-extrabold tracking-tight leading-none">SecureExam</p>
            <p className="text-[11px] text-white/50 leading-none mt-0.5">Admin Console</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-9 w-9 rounded-full bg-brand-500 flex items-center justify-center font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            className="btn-ghost w-full mt-1 justify-start text-red-300 hover:bg-red-500/10"
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
