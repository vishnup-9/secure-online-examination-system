import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { RiskBadge } from '../../components/Badge';

export default function AdminViolations() {
  const [events, setEvents] = useState(null);
  const [severity, setSeverity] = useState('');

  useEffect(() => { api.get('/violations', { params: { severity, limit: 100 } }).then((res) => setEvents(res.data.events)); }, [severity]);

  return (
    <div>
      <PageHeader title="Violations" subtitle="All logged proctoring events across exams" />
      <div className="p-8 space-y-4">
        <select className="input w-48" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="">All severities</option>
          <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option>
        </select>

        {!events ? <Loader /> : events.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="No violations logged" description="Anti-cheating events from exam sessions will appear here." />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-ink-500 uppercase bg-surface-muted">
                <tr><th className="text-left px-5 py-2.5">Student</th><th className="text-left px-5 py-2.5">Exam</th><th className="text-left px-5 py-2.5">Event</th><th className="text-left px-5 py-2.5">Severity</th><th className="text-left px-5 py-2.5">Time</th></tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e._id} className="border-t border-surface-border">
                    <td className="px-5 py-3 font-medium text-ink-900">{e.student?.name}</td>
                    <td className="px-5 py-3 text-ink-600">{e.exam?.title}</td>
                    <td className="px-5 py-3 text-ink-600">{e.eventType.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-3"><RiskBadge level={e.severity} /></td>
                    <td className="px-5 py-3 text-ink-400">{new Date(e.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
