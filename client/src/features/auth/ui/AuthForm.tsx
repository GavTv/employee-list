import { useState, type FormEvent } from 'react';
import { api } from '../../../shared/api/client';
import { getErrorMessage } from '../../../shared/api/errors';

type Props = { mode: 'login' | 'register'; onModeChange: (mode: 'login' | 'register') => void; onAuthenticated: (token: string) => void };

export function AuthForm({ mode, onModeChange, onAuthenticated }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <input id="password" type="password" autoComplete={registering ? 'new-password' : 'current-password'} placeholder="Не менее 8 символов" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={72} />
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-primary auth-submit" type="submit" disabled={submitting}>{submitting ? 'Подождите…' : registering ? 'Создать аккаунт' : 'Войти в аккаунт'}<span aria-hidden="true">→</span></button>
    <p className="auth-switch">{registering ? 'Уже есть аккаунт?' : 'Впервые здесь?'} <button type="button" className="text-button" onClick={() => { setError(''); onModeChange(registering ? 'login' : 'register'); }}>{registering ? 'Войти' : 'Создать аккаунт'}</button></p>
  </form>;
}
