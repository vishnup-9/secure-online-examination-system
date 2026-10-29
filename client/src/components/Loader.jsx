import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-500">
      <Loader2 className="animate-spin" size={28} />
      <p className="text-sm">{label}</p>
    </div>
  );
}
