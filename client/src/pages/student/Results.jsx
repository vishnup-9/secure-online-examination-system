import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

export default function StudentResults() {
  const [results, setResults] = useState(null);

  useEffect(() => { api.get('/results/student').then((res) => setResults(res.data.results)); }, []);

  if (!results) return <Loader />;

  return (
    <div>
      <PageHeader title="My Results" subtitle="Your exam performance history" />
      <div className="p-8">
        {results.length === 0 ? (
          <EmptyState icon={Award} title="No results yet" description="Complete an exam to see your results here." />
        ) : (
          <div className="grid gap-4">
            {results.map((r) => (
              <div key={r._id} className="card p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink-900">{r.exam?.title}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{r.exam?.subject} · Submitted {new Date(r.submittedAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ink-900">{r.result?.percentage}%</p>
                    <p className="text-xs text-ink-500">{r.result?.finalScore}/{r.result?.totalMarks} marks</p>
                  </div>
                  {r.result?.passed ? (
                    <span className="badge bg-green-50 text-green-700"><CheckCircle2 size={13} /> Passed</span>
                  ) : (
                    <span className="badge bg-red-50 text-red-700"><XCircle size={13} /> Failed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
