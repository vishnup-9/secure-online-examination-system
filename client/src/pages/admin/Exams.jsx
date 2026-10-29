import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FileText, Eye, EyeOff, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';

const emptyForm = {
  title: '', description: '', subject: '', durationMinutes: 30, passPercentage: 40,
  negativeMarking: false, negativeMarkValue: 0.25, startTime: '', endTime: '',
  randomizeQuestions: true, randomizeOptions: true, questions: []
};

export default function AdminExams() {
  const [exams, setExams] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => api.get('/exams').then((res) => setExams(res.data.exams));
  useEffect(() => { load(); api.get('/questions', { params: { limit: 200 } }).then((res) => setQuestions(res.data.questions)); }, []);

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (exam) => {
    setForm({
      title: exam.title, description: exam.description || '', subject: exam.subject || '',
      durationMinutes: exam.durationMinutes, passPercentage: exam.passPercentage,
      negativeMarking: exam.negativeMarking, negativeMarkValue: exam.negativeMarkValue,
      startTime: exam.startTime?.slice(0, 16), endTime: exam.endTime?.slice(0, 16),
      randomizeQuestions: exam.randomizeQuestions, randomizeOptions: exam.randomizeOptions,
      questions: exam.questions.map((q) => q._id || q)
    });
    setEditingId(exam._id);
    setShowForm(true);
  };

  const toggleQuestion = (qid) => {
    setForm((f) => ({ ...f, questions: f.questions.includes(qid) ? f.questions.filter((x) => x !== qid) : [...f.questions, qid] }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.questions.length) return toast.error('Select at least one question');
    try {
      if (editingId) await api.put(`/exams/${editingId}`, form);
      else await api.post('/exams', form);
      toast.success(editingId ? 'Exam updated' : 'Exam created');
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };

  const remove = async () => {
    try { await api.delete(`/exams/${deleteTarget._id}`); toast.success('Exam deleted'); setDeleteTarget(null); load(); }
    catch { toast.error('Delete failed'); }
  };

  const togglePublish = async (exam) => {
    try { await api.patch(`/exams/${exam._id}/publish`); load(); } catch { toast.error('Failed to update'); }
  };

  return (
    <div>
      <PageHeader title="Exams" subtitle="Create and manage exams" actions={<button className="btn-primary" onClick={openNew}><Plus size={16} /> Create Exam</button>} />
      <div className="p-8 space-y-4">
        {showForm && (
          <form onSubmit={submit} className="card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-ink-900">{editingId ? 'Edit Exam' : 'New Exam'}</p>
              <button type="button" onClick={() => setShowForm(false)}><X size={18} className="text-ink-400" /></button>
            </div>
            <input className="input" placeholder="Exam title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea className="input" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <input className="input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <input className="input" type="number" min={1} placeholder="Duration (min)" required value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
              <input className="input" type="number" min={0} max={100} placeholder="Pass %" value={form.passPercentage} onChange={(e) => setForm({ ...form, passPercentage: Number(e.target.value) })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="label">Start Time</label><input className="input" type="datetime-local" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
              <div><label className="label">End Time</label><input className="input" type="datetime-local" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.negativeMarking} onChange={(e) => setForm({ ...form, negativeMarking: e.target.checked })} /> Negative marking</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.randomizeQuestions} onChange={(e) => setForm({ ...form, randomizeQuestions: e.target.checked })} /> Randomize questions</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.randomizeOptions} onChange={(e) => setForm({ ...form, randomizeOptions: e.target.checked })} /> Randomize options</label>
            </div>
            <div>
              <label className="label">Select Questions ({form.questions.length} selected)</label>
              <div className="max-h-52 overflow-y-auto border border-surface-border rounded-xl divide-y divide-surface-border">
                {questions.map((q) => (
                  <label key={q._id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-surface-muted">
                    <input type="checkbox" checked={form.questions.includes(q._id)} onChange={() => toggleQuestion(q._id)} />
                    <span className="truncate">{q.text}</span>
                    <span className="ml-auto text-xs text-ink-400 shrink-0">{q.subject}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary">Save Exam</button>
            </div>
          </form>
        )}

        {!exams ? <Loader /> : exams.length === 0 ? (
          <EmptyState icon={FileText} title="No exams yet" action={<button className="btn-primary mt-2" onClick={openNew}><Plus size={16} /> Create your first exam</button>} />
        ) : (
          <div className="grid gap-3">
            {exams.map((exam) => (
              <div key={exam._id} className="card p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink-900">{exam.title}</p>
                    <span className={`badge ${exam.isPublished ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{exam.isPublished ? 'Published' : 'Draft'}</span>
                  </div>
                  <p className="text-xs text-ink-500 mt-1">{exam.totalQuestions} questions · {exam.durationMinutes} min · {exam.totalMarks} marks · {new Date(exam.startTime).toLocaleString()} → {new Date(exam.endTime).toLocaleString()}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button className="btn-ghost" onClick={() => togglePublish(exam)}>{exam.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                  <button className="btn-ghost" onClick={() => openEdit(exam)}><Pencil size={15} /></button>
                  <button className="btn-ghost text-red-600" onClick={() => setDeleteTarget(exam)}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog open={!!deleteTarget} title="Delete exam?" description="This cannot be undone." confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)} onConfirm={remove} />
    </div>
  );
}
