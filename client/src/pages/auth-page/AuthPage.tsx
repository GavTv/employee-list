import { AuthForm } from '../../features/auth/ui/AuthForm';

export function AuthPage(props: { mode: 'login' | 'register'; onModeChange: (mode: 'login' | 'register') => void; onAuthenticated: (token: string) => void }) {
  return <main className="auth-layout">
    <section className="auth-brand-panel">
      <a href="/" className="brand"><span className="brand-mark">к</span> команда<span className="brand-dot">.</span></a>
      <div className="brand-copy"><span className="eyebrow light">ПРОСТРАНСТВО КОМАНДЫ</span><h1>Люди —<br />главное.</h1><p>Все сотрудники и структура команды в одном удобном месте.</p></div>
      <div className="brand-footer"><span className="orbit orbit-one"/><span className="orbit orbit-two"/><span className="orbit orbit-three"/><span className="orbit-core">к</span><span className="footer-note">Работаем вместе</span></div>
    </section>
    <section className="auth-content"><div className="auth-content-inner">
      <div className="mobile-brand"><span className="brand-mark">к</span> команда<span className="brand-dot">.</span></div>
      <span className="eyebrow">ВАШ РАБОЧИЙ ПРОФИЛЬ</span>
      <h2>{props.mode === 'login' ? 'С возвращением' : 'Добро пожаловать'}</h2>
      <p className="auth-subtitle">{props.mode === 'login' ? 'Войдите, чтобы увидеть свою команду.' : 'Создайте аккаунт, чтобы продолжить.'}</p>
      <AuthForm {...props} />
      <p className="auth-legal">Продолжая, вы соглашаетесь с правилами использования сервиса.</p>
    </div></section>
  </main>;
}
