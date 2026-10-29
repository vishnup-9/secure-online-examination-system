import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="rounded-2xl bg-surface-muted p-4 text-ink-400"><Icon size={28} /></div>
      <h3 className="font-semibold text-ink-900">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-500">{description}</p>}
      {action}
    </div>
  );
}
