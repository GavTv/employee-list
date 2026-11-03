import { useState, type FormEvent } from 'react';

import styles from './AuthForm.module.css';
import { cn } from '@/lib/utils';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../../../shared/api/errors';

type Props = { mode: 'login' | 'register'; onModeChange: (mode: 'login' | 'register') => void; onAuthenticated: (token: string) => void };

export function AuthForm({ mode, onModeChange, onAuthenticated }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [attemptedRegistration, setAttemptedRegistration] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const registering = mode === 'register';
  const passwordsDoNotMatch = registering && attemptedRegistration && passwordConfirmation.length > 0 && password !== passwordConfirmation;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    if (registering) setAttemptedRegistration(true);
    if (registering && password !== passwordConfirmation) return;
    setSubmitting(true);
    try {
      const result = await authApi.authenticate(mode, { email, password });
      onAuthenticated(result.token);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSubmitting(false); }
  }

  return <form className={styles.authForm} onSubmit={submit}>
    <label className="field-label" htmlFor="email">Рабочая почта</label>
    <input id="email" type="email" autoComplete="email" placeholder="name@company.ru" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} />
    <label className="field-label" htmlFor="password">Пароль</label>
    <div className={styles.passwordInputWrap}>
      <input id="password" type={showPassword ? 'text' : 'password'} autoComplete={registering ? 'new-password' : 'current-password'} placeholder="Не менее 8 символов" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={72} />
      <button className={styles.passwordVisibility} type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'} title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>
        {showPassword ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.5 4.2 9.5 6-.4.7-1.3 2-2.7 3.3M6.2 6.2C3.9 7.6 2.8 9.4 2.5 11c1 1.8 4.3 6 9.5 6 1 0 1.9-.2 2.7-.5"/></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S5.8 6 12 6s9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/></svg>}
      </button>
    </div>
    {registering && <>
      <label className="field-label" htmlFor="password-confirmation">Повторите пароль</label>
      <div className={styles.passwordInputWrap}>
        <input id="password-confirmation" type={showPasswordConfirmation ? 'text' : 'password'} autoComplete="new-password" placeholder="Введите пароль ещё раз" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required maxLength={72} aria-invalid={passwordsDoNotMatch} aria-describedby={passwordsDoNotMatch ? 'password-confirmation-error' : undefined} />
        <button className={styles.passwordVisibility} type="button" onClick={() => setShowPasswordConfirmation((visible) => !visible)} aria-label={showPasswordConfirmation ? 'Скрыть повтор пароля' : 'Показать повтор пароля'} title={showPasswordConfirmation ? 'Скрыть пароль' : 'Показать пароль'}>
          {showPasswordConfirmation ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.5 4.2 9.5 6-.4.7-1.3 2-2.7 3.3M6.2 6.2C3.9 7.6 2.8 9.4 2.5 11c1 1.8 4.3 6 9.5 6 1 0 1.9-.2 2.7-.5"/></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S5.8 6 12 6s9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/></svg>}
        </button>
      </div>
      {passwordsDoNotMatch && <p className="form-error" id="password-confirmation-error" role="alert">Пароли не совпадают</p>}
    </>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className={cn("button", "button-primary", styles.authSubmit)} type="submit" disabled={submitting}>{submitting ? 'Подождите…' : registering ? 'Создать аккаунт' : 'Войти в аккаунт'}<span aria-hidden="true">→</span></button>
    <p className={styles.authSwitch}>{registering ? 'Уже есть аккаунт?' : 'Впервые здесь?'} <button type="button" className="text-button" onClick={() => { setError(''); setAttemptedRegistration(false); onModeChange(registering ? 'login' : 'register'); }}>{registering ? 'Войти' : 'Создать аккаунт'}</button></p>
  </form>;
}
