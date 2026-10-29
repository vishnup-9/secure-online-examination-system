import React, { useEffect, useState } from 'react';
import { Users, FileText, PlayCircle, CheckCircle2, TrendingUp, ShieldAlert } from 'lucide-react';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import { RiskBadge } from '../../components/Badge';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get('/dashboard/admin').then((res) => setData(res.data)); }, []);
  if (!data) return <Loader />;
  const { stats, recentActivity } = data;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of exams, students, and activity" />
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Students" value={stats.totalStudents} accent="brand" />
          <StatCard icon={FileText} label="Total Exams" value={stats.totalExams} accent="purple" />
          <StatCard icon={PlayCircle} label="Active Exams" value={stats.activeExams} accent="green" />
          <StatCard icon={CheckCircle2} label="Completed" value={stats.completedExams} accent="brand" />
          <StatCard icon={TrendingUp} label="Average Score" value={`${stats.averageScore}%`} accent="purple" />
          <StatCard icon={CheckCircle2} label="Pass Rate" value={`${stats.passPercentage}%`} accent="green" />
          <StatCard icon={ShieldAlert} label="Suspicious Attempts" value={stats.suspiciousAttempts} accent="red" />
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-surface-border font-semibold text-ink-900">Recent Activity</div>
          <table className="w-full text-sm">
            <thead className="text-xs text-ink-500 uppercase bg-surface-muted">
              <tr><th className="text-left px-5 py-2.5">Student</th><th className="text-left px-5 py-2.5">Exam</th><th className="text-left px-5 py-2.5">Status</th><th className="text-left px-5 py-2.5">Risk</th><th className="text-left px-5 py-2.5">Updated</th></tr>
            </thead>
            <tbody>
              {recentActivity.map((a) => (
                <tr key={a.id} className="border-t border-surface-border">
                  <td className="px-5 py-3 font-medium text-ink-900">{a.student}</td>
                  <td className="px-5 py-3 text-ink-600">{a.exam}</td>
                  <td className="px-5 py-3 text-ink-600 capitalize">{a.status?.replace('_', ' ')}</td>
                  <td className="px-5 py-3"><RiskBadge level={a.riskLevel} /></td>
                  <td className="px-5 py-3 text-ink-400">{new Date(a.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
              {recentActivity.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-ink-400">No activity yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
