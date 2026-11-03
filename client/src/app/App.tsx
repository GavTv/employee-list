import { useEffect, useState } from 'react';
import { AuthPage } from '../pages/auth-page/AuthPage';
import { EmployeesPage } from '../pages/employees-page/EmployeesPage';
import { getToken, setToken } from '../shared/api/token';

export function App() {
  const [token, updateToken] = useState<string | null>(() => getToken());
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [checking, setChecking] = useState(Boolean(token));

  useEffect(() => {
    if (!token) { setChecking(false); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => { if (!response.ok) throw new Error('Session expired'); })
      .catch(() => { setToken(null); updateToken(null); })
      .finally(() => setChecking(false));
  }, [token]);

  if (checking) return <main className="screen-center"><span className="spinner" aria-label="Загрузка" /></main>;
  if (!token) return <AuthPage mode={authMode} onModeChange={setAuthMode} onAuthenticated={(value) => { setToken(value); updateToken(value); }} />;
  return <EmployeesPage onLogout={() => { setToken(null); updateToken(null); setAuthMode('login'); }} />;
}
