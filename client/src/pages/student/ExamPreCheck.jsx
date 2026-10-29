import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Monitor, Camera, Wifi, Maximize, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import useFullscreen from '../../hooks/useFullscreen';

const CHECKS = [
  { key: 'browser', label: 'Browser Compatibility', icon: Monitor },
  { key: 'webcam', label: 'Webcam Access', icon: Camera },
  { key: 'network', label: 'Network Connection', icon: Wifi },
  { key: 'fullscreen', label: 'Fullscreen Support', icon: Maximize }
];

export default function ExamPreCheck() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enter } = useFullscreen();
  const [results, setResults] = useState({});
  const [checking, setChecking] = useState(true);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    async function runChecks() {
      const r = {};
      r.browser = typeof navigator.mediaDevices !== 'undefined' && typeof document.fullscreenEnabled !== 'undefined';
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        r.webcam = true;
      } catch { r.webcam = false; }
      r.network = navigator.onLine;
      r.fullscreen = document.fullscreenEnabled;
      setResults(r);
      setChecking(false);
    }
    runChecks();
  }, []);

  const allPassed = CHECKS.every((c) => results[c.key]);

  const beginExam = async () => {
    if (!allPassed || !consent) return;
    await enter();
    navigate(`/student/exam/${id}/live`);
  };

  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg card p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="rounded-xl bg-brand-50 text-brand-600 p-2"><ShieldAlert size={20} /></div>
          <h1 className="text-lg font-bold text-ink-900">Pre-Exam Security Check</h1>
        </div>
        <p className="text-sm text-ink-500 mb-6">We verify your environment before starting a monitored exam.</p>

        <div className="space-y-2 mb-6">
          {CHECKS.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
              <div className="flex items-center gap-2.5 text-sm font-medium text-ink-900"><Icon size={16} className="text-ink-500" /> {label}</div>
              {checking ? <Loader2 size={16} className="animate-spin text-ink-400" /> :
                results[key] ? <CheckCircle2 size={18} className="text-green-600" /> : <XCircle size={18} className="text-red-600" />}
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 mb-4 space-y-1">
          <p className="font-semibold">Monitoring Rules</p>
          <p>This exam uses webcam-based AI monitoring. Your face must remain visible throughout. Tab switches, fullscreen exits, copy/paste, and right-click are detected and logged. Repeated or severe violations may automatically submit your exam.</p>
          <p>Webcam video is processed locally and never stored — only security event metadata is recorded. No facial identification is performed.</p>
        </div>

        <label className="flex items-start gap-2 text-sm text-ink-700 mb-6 cursor-pointer">
          <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          I understand and consent to webcam and browser activity monitoring during this exam.
        </label>

        <button
          className="btn-primary w-full"
          disabled={!allPassed || !consent || checking}
          onClick={beginExam}
        >
          {checking ? 'Running checks...' : allPassed ? 'Enter Fullscreen & Begin Exam' : 'Resolve issues above to continue'}
        </button>
      </div>
    </div>
  );
}
