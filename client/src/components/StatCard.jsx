import React from 'react';

export default function StatCard({ icon: Icon, label, value, accent = 'brand' }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`rounded-xl p-3 ${colors[accent]}`}><Icon size={20} /></div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
        <p className="text-2xl font-bold text-ink-900">{value}</p>
      </div>
    </div>
  );
}
