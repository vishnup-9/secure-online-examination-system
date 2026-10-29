import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('secureexam_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('secureexam_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('secureexam_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('secureexam_token');
        localStorage.removeItem('secureexam_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (role, email, password) => {
    const res = await api.post(`/auth/${role}/login`, { email, password });
    localStorage.setItem('secureexam_token', res.data.token);
    localStorage.setItem('secureexam_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.post('/auth/student/register', payload);
    localStorage.setItem('secureexam_token', res.data.token);
    localStorage.setItem('secureexam_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('secureexam_token');
    localStorage.removeItem('secureexam_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
