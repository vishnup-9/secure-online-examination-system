import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-sm p-4">
      <div className="card w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-150">
        <button onClick={onCancel} className="absolute right-4 top-4 text-ink-400 hover:text-ink-700"><X size={18} /></button>
        <div className={`mb-3 inline-flex rounded-xl p-2.5 ${danger ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
          <AlertTriangle size={20} />
        </div>
        <h3 className="font-semibold text-ink-900 mb-1">{title}</h3>
        {description && <p className="text-sm text-ink-500 mb-5">{description}</p>}
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
