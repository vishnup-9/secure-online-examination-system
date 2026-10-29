import React from 'react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';

export default function StudentProfile() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="Profile" subtitle="Your account information" />
      <div className="p-8 max-w-lg">
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg text-ink-900">{user?.name}</p>
              <p className="text-sm text-ink-500">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-surface-border">
            <div><p className="label">Roll Number</p><p className="text-sm font-medium text-ink-900">{user?.rollNumber || '—'}</p></div>
            <div><p className="label">Department</p><p className="text-sm font-medium text-ink-900">{user?.department || '—'}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
