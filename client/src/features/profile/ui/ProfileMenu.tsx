import { useEffect, useRef, useState } from 'react';
import { api } from '../../../shared/api/client';
import { getErrorMessage } from '../../../shared/api/errors';

type UserProfile = { email: string; profileImage: string | null };

export function ProfileMenu({ onLogout }: { onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<{ user: UserProfile }>('/auth/me').then(({ user }) => setProfile(user)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  async function savePhoto(profileImage: string | null) {
    setBusy(true); setError('');
    try {
      const result = await api<{ profileImage: string | null }>('/auth/profile', { method: 'PATCH', body: JSON.stringify({ profileImage }) });
      setProfile((current) => current ? { ...current, profileImage: result.profileImage } : current);
    } catch (cause) { setError(getErrorMessage(cause)); }
    finally { setBusy(false); }
  }

  function uploadPhoto(file?: File) {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Выбери изображение PNG, JPEG или WebP.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setError('Размер изображения должен быть не больше 1 МБ.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') void savePhoto(reader.result); };
    reader.onerror = () => setError('Не получилось прочитать файл. Попробуй ещё раз.');
    reader.readAsDataURL(file);
  }

  return <div className="profile-menu-root" ref={rootRef}>
    <button className="profile-button" type="button" aria-label="Открыть меню профиля" aria-haspopup="menu" aria-expanded={open} onClick={() => { setOpen((value) => !value); setError(''); }}>
      <span className="profile-avatar">{profile?.profileImage ? <img src={profile.profileImage} alt="Фото профиля" /> : 'Я'}</span>
      <span className="profile-caret">⌄</span>
    </button>
    {open && <div className="profile-menu" role="menu" aria-label="Меню профиля">
      <div className="profile-menu-user"><span className="profile-avatar profile-menu-avatar">{profile?.profileImage ? <img src={profile.profileImage} alt="" /> : 'Я'}</span><span><strong>Мой профиль</strong><small>{profile?.email || 'Загружаем…'}</small></span></div>
      <div className="profile-menu-divider" />
      <input ref={fileRef} className="profile-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { uploadPhoto(event.target.files?.[0]); event.target.value = ''; }} />
      <button className="profile-menu-action" type="button" role="menuitem" disabled={busy} onClick={() => fileRef.current?.click()}><span aria-hidden="true">▧</span>{busy ? 'Сохраняем…' : profile?.profileImage ? 'Изменить фото профиля' : 'Добавить фото профиля'}</button>
      {profile?.profileImage && <button className="profile-menu-action" type="button" role="menuitem" disabled={busy} onClick={() => void savePhoto(null)}><span aria-hidden="true">⌫</span>Удалить фото</button>}
      {error && <p className="profile-menu-error" role="alert">{error}</p>}
      <div className="profile-menu-divider" />
      <button className="profile-menu-action profile-menu-logout" type="button" role="menuitem" onClick={onLogout}><span aria-hidden="true">↗</span>Выйти из аккаунта</button>
    </div>}
  </div>;
}
