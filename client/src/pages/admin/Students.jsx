import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, UserX2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function AdminStudents() {
  const [students, setStudents] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', rollNumber: '', department: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => api.get('/students', { params: { search } }).then((res) => setStudents(res.data.students));
  useEffect(() => { load(); }, [search]);

  const createStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students', form);
      toast.success('Student added');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', rollNumber: '', department: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add student'); }
  };

  const remove = async () => {
    try { await api.delete(`/students/${deleteTarget._id}`); toast.success('Student removed'); setDeleteTarget(null); load(); }
    catch { toast.error('Failed to remove student'); }
  };

  return (
    <div>
      <PageHeader title="Students" subtitle="Manage registered students" actions={
        <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Add Student</button>
      } />
      <div className="p-8 space-y-4">
        <div className="relative max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {showForm && (
          <form onSubmit={createStudent} className="card p-5 grid grid-cols-2 gap-3">
            <input className="input" placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input" placeholder="Password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <input className="input" placeholder="Roll number" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
            <input className="input col-span-2" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary">Save Student</button>
            </div>
          </form>
        )}

        {!students ? <Loader /> : students.length === 0 ? (
          <EmptyState icon={UserX2} title="No students found" />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-xs text-ink-500 uppercase bg-surface-muted">
                <tr><th className="text-left px-5 py-2.5">Name</th><th className="text-left px-5 py-2.5">Email</th><th className="text-left px-5 py-2.5">Roll No.</th><th className="text-left px-5 py-2.5">Department</th><th className="px-5 py-2.5"></th></tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className="border-t border-surface-border">
                    <td className="px-5 py-3 font-medium text-ink-900">{s.name}</td>
                    <td className="px-5 py-3 text-ink-600">{s.email}</td>
                    <td className="px-5 py-3 text-ink-600">{s.rollNumber || '—'}</td>
                    <td className="px-5 py-3 text-ink-600">{s.department || '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <button className="btn-ghost text-red-600" onClick={() => setDeleteTarget(s)}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog open={!!deleteTarget} title="Remove student?" description={`This will permanently remove ${deleteTarget?.name}.`}
        confirmLabel="Remove" onCancel={() => setDeleteTarget(null)} onConfirm={remove} />
    </div>
  );
}
