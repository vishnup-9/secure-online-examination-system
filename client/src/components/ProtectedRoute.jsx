import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-ink-500">Loading...</div>;
  if (!user) return <Navigate to={`/${role}/login`} replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
}
