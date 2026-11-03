import { ArrowDownRight, ArrowUpRight, Asterisk, ScanLine } from 'lucide-react';
import { AuthForm } from '../../features/auth';
import styles from './AuthPage.module.css';

type Props = {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
  onAuthenticated: (token: string) => void;
};

export function AuthPage(props: Props) {
  return <main className={styles.accessPage}>
    <header className={styles.topbar}>
      <a href="/" className={styles.brand} aria-label="Состав — главная"><span>с</span>состав<i>/</i></a>
      <div className={styles.topbarLabel}><ScanLine size={15} strokeWidth={1.7} /> <span>ПРОСТРАНСТВО КОМАНДЫ</span></div>
      <span className={styles.topbarStatus}><i /> ДОСТУП ОТКРЫТ</span>
    </header>

    <div className={styles.accessWrap}>
      <section className={styles.introBand}>
        <div className={styles.introText}>
          <span className={styles.eyebrow}>КОМАНДНЫЙ СПРАВОЧНИК <b>·</b> 001</span>
          <h1>Работа — это<br /><strong>люди рядом.</strong></h1>
          <p>Единое место, где видно, кто за что отвечает<br className={styles.desktopBreak} /> и к кому обратиться за следующим шагом.</p>
        </div>
        <div className={styles.introArt} aria-hidden="true">
          <div className={styles.artOrbit}><span /><span /><span /></div>
          <div className={styles.artDisc}>С<span>+</span></div>
          <span className={styles.artTag}>КОМАНДА / 01</span>
          <span className={styles.artSpark}><Asterisk size={29} strokeWidth={1.2} /></span>
        </div>
        <div className={styles.introFoot}><span>ЛЮДИ / РОЛИ / ОТДЕЛЫ</span><span>РАБОЧЕЕ ПРОСТРАНСТВО <b>↘</b></span></div>
      </section>

      <section className={styles.accessGrid}>
        <div className={styles.formCard}>
          <div className={styles.formCardTop}><span>{props.mode === 'login' ? '01 / ВХОД' : '01 / РЕГИСТРАЦИЯ'}</span><ArrowDownRight size={18} strokeWidth={1.5} /></div>
          <h2>{props.mode === 'login' ? 'С возвращением.' : 'Начнём знакомство.'}</h2>
          <p className={styles.formIntro}>{props.mode === 'login' ? 'Войдите, чтобы открыть справочник команды.' : 'Создайте доступ к рабочему пространству команды.'}</p>
          <AuthForm {...props} />
        </div>
        <aside className={styles.sideNotes}>
          <div className={styles.sideNoteLead}><span>ЗДЕСЬ НАХОДЯТ</span><ArrowUpRight size={16} /></div>
          <div className={styles.noteRow}><b>01</b><div><strong>Нужного человека</strong><span>Имя и отдел — в одном поиске</span></div></div>
          <div className={styles.noteRow}><b>02</b><div><strong>Область ответственности</strong><span>Роль каждого участника команды</span></div></div>
          <div className={styles.noteRow}><b>03</b><div><strong>Следующий контакт</strong><span>Без лишних кругов и пересылок</span></div></div>
          <div className={styles.sideNoteFooter}><span>СОСТАВ / 001</span><span>ИНДЕКС КОМАНДЫ</span></div>
        </aside>
      </section>
    </div>
    <footer className={styles.pageFooter}><span>СОСТАВ<i>/</i></span><span>ВНУТРЕННИЙ ИНСТРУМЕНТ ДЛЯ КОМАНДЫ</span><span>МОСКВА · 2026</span></footer>
  </main>;
}
