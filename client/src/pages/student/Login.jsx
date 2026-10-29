import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function StudentLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'student@example.com', password: 'Student@12345' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login('student', form.email, form.password);
      toast.success('Welcome back!');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="rounded-2xl bg-brand-600 p-3 text-white mb-3"><ShieldCheck size={26} /></div>
          <h1 className="text-xl font-bold text-ink-900">Student Portal</h1>
          <p className="text-sm text-ink-500">Sign in to access your exams</p>
        </div>
        <form onSubmit={submit} className="card p-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            <LogIn size={16} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-xs text-center text-ink-400 bg-surface-muted rounded-lg py-2">
            Demo: student@example.com / Student@12345
          </p>
        </form>
        <p className="text-center text-sm text-ink-500 mt-4">
          New here? <Link to="/student/register" className="text-brand-600 font-semibold">Create an account</Link>
        </p>
        <p className="text-center text-xs text-ink-400 mt-2">
          <Link to="/admin/login" className="hover:text-ink-600">Admin Portal →</Link>
        </p>
      </div>
    </div>
  );
}
