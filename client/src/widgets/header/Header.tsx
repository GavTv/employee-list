import { ProfileMenu } from '../../features/profile';
import { UsersRound } from 'lucide-react';

import styles from './Header.module.css';

export function Header({ onLogout }: { onLogout: () => void }) {
  return <header className={styles.topbar}>
    <a href="/" className={styles.brand}><span className={styles.brandMark}>с</span><span>состав<i>/</i><small>КОМАНДНЫЙ СПРАВОЧНИК</small></span></a>
    <nav className={styles.topbarNav} aria-label="Основная навигация"><a href="/" aria-current="page"><UsersRound size={15} /> Команда</a><span>001</span></nav>
    <div className={styles.topbarRight}>
      <div className={styles.workspaceBadge}><i aria-hidden="true" />РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <div className={styles.topbarDivider} aria-hidden="true" />
      <ProfileMenu onLogout={onLogout} />
      <button className={styles.logoutButton} type="button" onClick={onLogout}>Выйти</button>
    </div>
  </header>;
}
