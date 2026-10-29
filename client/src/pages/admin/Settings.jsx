import React from 'react';
import { Settings2, Info } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function AdminSettings() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="System configuration" />
      <div className="p-8 max-w-2xl space-y-5">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3 font-semibold text-ink-900"><Settings2 size={17} /> Per-exam security settings</div>
          <p className="text-sm text-ink-500">
            Violation thresholds, fullscreen/webcam requirements, warning limits, and auto-submit behavior
            are configured individually for each exam. Open an exam under <strong>Exams</strong> and edit its
            security settings there, so different exams can enforce different levels of strictness.
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3 font-semibold text-ink-900"><Info size={17} /> Privacy & AI monitoring</div>
          <p className="text-sm text-ink-500">
            Webcam frames are analyzed entirely in the student's browser. No continuous video is uploaded or stored —
            only security event metadata (event type, timestamp, severity) is saved. No facial identification or
            recognition is performed at any point.
          </p>
        </div>
      </div>
    </div>
  );
}
