import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, TrendingUp, PlayCircle } from 'lucide-react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

function ExamCard({ exam, kind }) {
  return (
    <div className="card p-4 flex items-center justify-between">
      <div>
        <p className="font-semibold text-ink-900">{exam.title}</p>
        <p className="text-xs text-ink-500 mt-0.5">
          {exam.subject} · {exam.durationMinutes} min · {new Date(exam.startTime).toLocaleString()}
        </p>
      </div>
      {kind === 'active' && (
        <Link to={`/student/exam/${exam._id}`} className="btn-primary"><PlayCircle size={16} /> Start</Link>
      )}
      {kind === 'upcoming' && <span className="badge bg-slate-100 text-slate-600">Upcoming</span>}
      {kind === 'completed' && <span className="badge bg-green-50 text-green-700">Ended</span>}
    </div>
  );
}

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/exams/student'), api.get('/dashboard/student')])
      .then(([examsRes, statsRes]) => { setData(examsRes.data); setStats(statsRes.data.stats); });
  }, []);

  if (!data) return <Loader />;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your exams at a glance" />
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Calendar} label="Upcoming Exams" value={stats?.upcomingExams ?? '—'} accent="brand" />
          <StatCard icon={CheckCircle2} label="Completed" value={stats?.completedExams ?? '—'} accent="green" />
          <StatCard icon={TrendingUp} label="Average Score" value={`${stats?.averageScore ?? 0}%`} accent="purple" />
        </div>

        <section>
          <h2 className="font-semibold text-ink-900 mb-3 flex items-center gap-2"><PlayCircle size={17} className="text-brand-600" /> Active Exams</h2>
          {data.active.length ? (
            <div className="space-y-3">{data.active.map((e) => <ExamCard key={e._id} exam={e} kind="active" />)}</div>
          ) : <EmptyState icon={PlayCircle} title="No active exams" description="Exams currently open for attempt will appear here." />}
        </section>

        <section>
          <h2 className="font-semibold text-ink-900 mb-3 flex items-center gap-2"><Clock size={17} className="text-ink-500" /> Upcoming Exams</h2>
          {data.upcoming.length ? (
            <div className="space-y-3">{data.upcoming.map((e) => <ExamCard key={e._id} exam={e} kind="upcoming" />)}</div>
          ) : <EmptyState icon={Calendar} title="No upcoming exams" />}
        </section>

        <section>
          <h2 className="font-semibold text-ink-900 mb-3 flex items-center gap-2"><CheckCircle2 size={17} className="text-green-600" /> Completed Exams</h2>
          {data.completed.length ? (
            <div className="space-y-3">{data.completed.map((e) => <ExamCard key={e._id} exam={e} kind="completed" />)}</div>
          ) : <EmptyState icon={CheckCircle2} title="No completed exams yet" />}
        </section>
      </div>
    </div>
  );
}
