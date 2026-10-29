import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function StudentRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', rollNumber: '', department: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="rounded-2xl bg-brand-600 p-3 text-white mb-3"><ShieldCheck size={26} /></div>
          <h1 className="text-xl font-bold text-ink-900">Create Student Account</h1>
        </div>
        <form onSubmit={submit} className="card p-6 space-y-3">
          <div><label className="label">Full Name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Email</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Password</label>
            <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div><label className="label">Roll Number</label>
            <input className="input" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} /></div>
          <div><label className="label">Department</label>
            <input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
          <button className="btn-primary w-full" disabled={loading}><UserPlus size={16} /> {loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p className="text-center text-sm text-ink-500 mt-4">
          Already have an account? <Link to="/student/login" className="text-brand-600 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
