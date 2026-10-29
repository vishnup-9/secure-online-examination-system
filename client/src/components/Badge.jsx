import React from 'react';

const RISK_STYLES = {
  LOW: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  MEDIUM: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
  HIGH: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  CRITICAL: 'bg-red-50 text-red-700 ring-1 ring-red-200'
};

export function RiskBadge({ level }) {
  return <span className={`badge ${RISK_STYLES[level] || RISK_STYLES.LOW}`}>{level}</span>;
}

const STATUS_STYLES = {
  not_started: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  submitted: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  auto_submitted: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  flagged_terminated: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  published: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  draft: 'bg-slate-100 text-slate-600'
};

export function StatusBadge({ status, label }) {
  return <span className={`badge ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>{label || status}</span>;
}
