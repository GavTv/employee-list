import { useState, type FormEvent } from 'react';
import { api } from '../../../shared/api/client';
import { getErrorMessage } from '../../../shared/api/errors';

type Props = { mode: 'login' | 'register'; onModeChange: (mode: 'login' | 'register') => void; onAuthenticated: (token: string) => void };

export function AuthForm({ mode, onModeChange, onAuthenticated }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const registering = mode === 'register';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSubmitting(true);
    try {
      const result = await api<{ token: string }>(`/auth/${mode}`, { method: 'POST', body: JSON.stringify({ email, password }) });
      onAuthenticated(result.token);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSubmitting(false); }
  }

  return <form className="auth-form" onSubmit={submit}>
    <label className="field-label" htmlFor="email">Рабочая почта</label>
    <input id="email" type="email" autoComplete="email" placeholder="name@company.ru" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} />
    <label className="field-label" htmlFor="password">Пароль</label>
    <div className="password-input-wrap">
      <input id="password" type={showPassword ? 'text' : 'password'} autoComplete={registering ? 'new-password' : 'current-password'} placeholder="Не менее 8 символов" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={72} />
      <button className="password-visibility" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'} title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>
        {showPassword ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.5 4.2 9.5 6-.4.7-1.3 2-2.7 3.3M6.2 6.2C3.9 7.6 2.8 9.4 2.5 11c1 1.8 4.3 6 9.5 6 1 0 1.9-.2 2.7-.5"/></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S5.8 6 12 6s9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/></svg>}
      </button>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-primary auth-submit" type="submit" disabled={submitting}>{submitting ? 'Подождите…' : registering ? 'Создать аккаунт' : 'Войти в аккаунт'}<span aria-hidden="true">→</span></button>
    <p className="auth-switch">{registering ? 'Уже есть аккаунт?' : 'Впервые здесь?'} <button type="button" className="text-button" onClick={() => { setError(''); onModeChange(registering ? 'login' : 'register'); }}>{registering ? 'Войти' : 'Создать аккаунт'}</button></p>
  </form>;
}
