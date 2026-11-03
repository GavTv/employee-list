import { ProfileMenu } from '../../features/profile/ui/ProfileMenu';

export function Header({ onLogout }: { onLogout: () => void }) {
  return <header className="topbar"><a href="/" className="brand"><span className="brand-mark">к</span> команда<span className="brand-dot">.</span></a><div className="topbar-right"><span className="workspace-badge"><i /> Рабочее пространство</span><div className="topbar-divider"/><ProfileMenu onLogout={onLogout} /><button className="logout-button" type="button" onClick={onLogout}>Выйти</button></div></header>;
}
