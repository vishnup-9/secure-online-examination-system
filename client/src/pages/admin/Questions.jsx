import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Pencil, HelpCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';

const emptyForm = { text: '', options: ['', '', '', ''], correctOptionIndex: 0, subject: '', category: '', difficulty: 'medium', marks: 1, negativeMarks: 0.25 };

export default function AdminQuestions() {
  const [questions, setQuestions] = useState(null);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => api.get('/questions', { params: { search, subject, difficulty, limit: 100 } }).then((res) => setQuestions(res.data.questions));
  useEffect(() => { load(); }, [search, subject, difficulty]);

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (q) => {
    setForm({
      text: q.text, options: q.options.map((o) => o.text), correctOptionIndex: q.correctOptionIndex,
      subject: q.subject, category: q.category || '', difficulty: q.difficulty, marks: q.marks, negativeMarks: q.negativeMarks
    });
    setEditingId(q._id);
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, options: form.options.filter((o) => o.trim()) };
    if (payload.options.length < 2) return toast.error('Provide at least 2 options');
    try {
      if (editingId) await api.put(`/questions/${editingId}`, payload);
      else await api.post('/questions', payload);
      toast.success(editingId ? 'Question updated' : 'Question created');
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };

  const remove = async () => {
    try { await api.delete(`/questions/${deleteTarget._id}`); toast.success('Question deleted'); setDeleteTarget(null); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <PageHeader title="Questions" subtitle="Manage the question bank" actions={<button className="btn-primary" onClick={openNew}><Plus size={16} /> Add Question</button>} />
      <div className="p-8 space-y-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input className="input pl-9" placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <input className="input w-40" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <select className="input w-40" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">All difficulties</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
          </select>
        </div>

        {showForm && (
          <form onSubmit={submit} className="card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-ink-900">{editingId ? 'Edit Question' : 'New Question'}</p>
              <button type="button" onClick={() => setShowForm(false)}><X size={18} className="text-ink-400" /></button>
            </div>
            <textarea className="input" rows={2} placeholder="Question text" required value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              {form.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="radio" checked={form.correctOptionIndex === idx} onChange={() => setForm({ ...form, correctOptionIndex: idx })} />
                  <input className="input" placeholder={`Option ${idx + 1}`} value={opt} onChange={(e) => {
                    const opts = [...form.options]; opts[idx] = e.target.value; setForm({ ...form, options: opts });
                  }} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              <input className="input" placeholder="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
              <input className="input" type="number" min={0} step="0.25" placeholder="Marks" value={form.marks} onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })} />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary">Save Question</button>
            </div>
          </form>
        )}

        {!questions ? <Loader /> : questions.length === 0 ? (
          <EmptyState icon={HelpCircle} title="No questions found" />
        ) : (
          <div className="grid gap-3">
            {questions.map((q) => (
              <div key={q._id} className="card p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900">{q.text}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="badge bg-brand-50 text-brand-700">{q.subject}</span>
                    <span className="badge bg-slate-100 text-slate-600 capitalize">{q.difficulty}</span>
                    <span className="badge bg-slate-100 text-slate-600">{q.marks} marks</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button className="btn-ghost" onClick={() => openEdit(q)}><Pencil size={15} /></button>
                  <button className="btn-ghost text-red-600" onClick={() => setDeleteTarget(q)}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog open={!!deleteTarget} title="Delete question?" description="This cannot be undone." confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)} onConfirm={remove} />
    </div>
  );
}
