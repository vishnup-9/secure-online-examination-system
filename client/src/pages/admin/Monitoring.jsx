import React, { useEffect, useState } from 'react';
import { Video, Camera, CameraOff, Eye, EyeOff } from 'lucide-react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { RiskBadge } from '../../components/Badge';

export default function AdminMonitoring() {
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    const load = () => api.get('/monitoring/active').then((res) => setAttempts(res.data.activeAttempts)).catch(() => {});
    load();
    const interval = setInterval(load, 5000); // polling — simplest reliable approach for this scale
    return () => clearInterval(interval);
  }, []);

  const fmt = (s) => { const m = Math.floor(s / 60); const sec = s % 60; return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`; };

  return (
    <div>
      <PageHeader title="Live Monitoring" subtitle={`${attempts.length} student(s) currently taking an exam · auto-refreshing every 5s`} />
      <div className="p-8">
        {attempts.length === 0 ? (
          <EmptyState icon={Video} title="No active exam sessions" description="Students currently taking a monitored exam will appear here in real time." />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {attempts.map((a) => (
              <div key={a.attemptId} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-ink-900">{a.student}</p>
                    <p className="text-xs text-ink-500">{a.exam}</p>
                  </div>
                  <RiskBadge level={a.riskLevel} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-ink-600 mb-3">
                  <div className="flex items-center gap-1.5">{a.cameraActive ? <Camera size={13} className="text-green-600" /> : <CameraOff size={13} className="text-red-600" />} Camera {a.cameraActive ? 'Active' : 'Off'}</div>
                  <div className="flex items-center gap-1.5">{a.faceDetected ? <Eye size={13} className="text-green-600" /> : <EyeOff size={13} className="text-red-600" />} Face {a.faceDetected ? 'Detected' : 'Not detected'}</div>
                  <div>Time left: <span className="font-mono font-semibold">{fmt(a.remainingSeconds)}</span></div>
                  <div>Violations: <span className="font-semibold">{a.violationCount}</span></div>
                </div>
                <div className="mb-1 flex justify-between text-xs text-ink-500"><span>Progress</span><span>{a.answered}/{a.total}</span></div>
                <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden"><div className="h-full bg-brand-600" style={{ width: `${a.total ? (a.answered / a.total) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
