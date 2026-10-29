import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@example.com', password: 'Admin@12345' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login('admin', form.email, form.password);
      toast.success('Welcome, admin');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-900 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="rounded-2xl bg-brand-500 p-3 text-white mb-3"><ShieldCheck size={26} /></div>
          <h1 className="text-xl font-bold text-white">Admin Console</h1>
          <p className="text-sm text-white/50">Manage exams, students, and monitoring</p>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn-primary w-full" disabled={loading}><LogIn size={16} /> {loading ? 'Signing in...' : 'Sign In'}</button>
          <p className="text-xs text-center text-ink-400 bg-surface-muted rounded-lg py-2">Demo: admin@example.com / Admin@12345</p>
        </form>
        <p className="text-center text-xs text-white/40 mt-4">
          <Link to="/student/login" className="hover:text-white/70">Student Portal →</Link>
        </p>
      </div>
    </div>
  );
}
