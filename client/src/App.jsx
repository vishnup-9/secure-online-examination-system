import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import StudentLayout from './components/StudentLayout';
import AdminLayout from './components/AdminLayout';

import StudentLogin from './pages/student/Login';
import StudentRegister from './pages/student/Register';
import StudentDashboard from './pages/student/Dashboard';
import StudentExamPreCheck from './pages/student/ExamPreCheck';
import StudentExam from './pages/student/Exam';
import StudentResults from './pages/student/Results';
import StudentProfile from './pages/student/Profile';

import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminExams from './pages/admin/Exams';
import AdminQuestions from './pages/admin/Questions';
import AdminResults from './pages/admin/Results';
import AdminMonitoring from './pages/admin/Monitoring';
import AdminViolations from './pages/admin/Violations';
import AdminSettings from './pages/admin/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/student/login" replace />} />

      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/student/exam/:id" element={<ProtectedRoute role="student"><StudentExamPreCheck /></ProtectedRoute>} />
      <Route path="/student/exam/:id/live" element={<ProtectedRoute role="student"><StudentExam /></ProtectedRoute>} />

      <Route path="/student" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="exams" element={<AdminExams />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="monitoring" element={<AdminMonitoring />} />
        <Route path="violations" element={<AdminViolations />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/student/login" replace />} />
    </Routes>
  );
}
