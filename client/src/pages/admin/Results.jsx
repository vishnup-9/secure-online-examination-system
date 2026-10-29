import React, { useEffect, useState } from 'react';
import { Search, Download, Award } from 'lucide-react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { RiskBadge, StatusBadge } from '../../components/Badge';

export default function AdminResults() {
  const [results, setResults] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { api.get('/results', { params: { search, limit: 100 } }).then((res) => setResults(res.data.results)); }, [search]);

  const exportCsv = () => { window.open('/api/results/export/csv?' + new URLSearchParams({ token: localStorage.getItem('secureexam_token') }), '_blank'); };

  return (
    <div>
      <PageHeader title="Results" subtitle="All student exam results" actions={
        <a className="btn-secondary" href="/api/results/export/csv" target="_blank" rel="noreferrer" onClick={(e) => {
          e.preventDefault();
          api.get('/results/export/csv', { responseType: 'blob' }).then((res) => {
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a'); a.href = url; a.download = 'results.csv'; a.click();
          });
        }}><Download size={16} /> Export CSV</a>
      } />
      <div className="p-8 space-y-4">
        <div className="relative max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Search by student..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {!results ? <Loader /> : results.length === 0 ? (
          <EmptyState icon={Award} title="No results yet" />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-ink-500 uppercase bg-surface-muted">
                <tr>
                  <th className="text-left px-5 py-2.5">Student</th><th className="text-left px-5 py-2.5">Exam</th>
                  <th className="text-left px-5 py-2.5">Score</th><th className="text-left px-5 py-2.5">Status</th>
                  <th className="text-left px-5 py-2.5">Risk</th><th className="text-left px-5 py-2.5">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id} className="border-t border-surface-border">
                    <td className="px-5 py-3 font-medium text-ink-900">{r.student?.name}</td>
                    <td className="px-5 py-3 text-ink-600">{r.exam?.title}</td>
                    <td className="px-5 py-3 text-ink-600">{r.result?.percentage}% ({r.result?.finalScore}/{r.result?.totalMarks})</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} label={r.result?.passed ? 'Passed' : 'Failed'} /></td>
                    <td className="px-5 py-3"><RiskBadge level={r.riskLevel} /></td>
                    <td className="px-5 py-3 text-ink-400">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '—'}</td>
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
