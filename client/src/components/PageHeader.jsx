import React from 'react';

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-center justify-between px-8 py-6 border-b border-surface-border bg-surface">
      <div>
        <h1 className="text-xl font-bold text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
