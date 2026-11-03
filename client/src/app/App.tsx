import { lazy, Suspense, useEffect, useState } from 'react';
import { userApi } from '../entities/user/api/userApi';
import { getToken, setToken } from '../shared/api/token';

const AuthPage = lazy(() => import('../pages/auth-page/AuthPage').then(({ AuthPage: page }) => ({ default: page })));
const EmployeesPage = lazy(() => import('../pages/employees-page/EmployeesPage').then(({ EmployeesPage: page }) => ({ default: page })));

export function App() {
  const [token, updateToken] = useState<string | null>(() => getToken());
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [checking, setChecking] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    userApi.current()
      .catch(() => { setToken(null); updateToken(null); })
      .finally(() => setChecking(false));
  }, [token]);

  if (checking) return <main className="screen-center"><span className="spinner" aria-label="Загрузка" /></main>;
  return <Suspense fallback={<main className="screen-center"><span className="spinner" aria-label="Загрузка страницы" /></main>}>
    {!token
      ? <AuthPage mode={authMode} onModeChange={setAuthMode} onAuthenticated={(value) => { setToken(value); updateToken(value); }} />
      : <EmployeesPage onLogout={() => { setToken(null); updateToken(null); setAuthMode('login'); }} />}
  </Suspense>;
}
