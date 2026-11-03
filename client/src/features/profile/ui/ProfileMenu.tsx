import { useEffect, useState } from 'react';
import { Camera, ImagePlus, Sparkles, Trash2 } from 'lucide-react';
import ProfileDropdown, { type Account, type ProfileMenuItem } from '@/components/kokonutui/profile-dropdown';
import AvatarPicker from '@/components/kokonutui/avatar-picker';
import FileUpload, { type UploadHelpers } from '@/components/kokonutui/file-upload';
import { api } from '@/shared/api/client';

type UserProfile = { id: number; email: string; profileImage: string | null };
type MediaMode = 'upload' | 'generated';

function readImage(file: File, signal: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException('Загрузка отменена', 'AbortError'));
    const reader = new FileReader();
    const cleanup = () => signal.removeEventListener('abort', abort);
    const abort = () => { reader.abort(); reject(new DOMException('Загрузка отменена', 'AbortError')); };
    signal.addEventListener('abort', abort, { once: true });
    reader.onload = () => {
      cleanup();
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Не удалось прочитать изображение'));
    };
    reader.onerror = () => { cleanup(); reject(new Error('Не удалось прочитать изображение')); };
    reader.onabort = () => { cleanup(); reject(new DOMException('Загрузка отменена', 'AbortError')); };
    reader.readAsDataURL(file);
  });
}

export function ProfileMenu({ onLogout }: { onLogout: () => void }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mediaMode, setMediaMode] = useState<MediaMode | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ user: UserProfile }>('/auth/me').then(({ user }) => setProfile(user)).catch(() => undefined);
  }, []);

  async function saveProfileImage(profileImage: string | null) {
    const result = await api<{ profileImage: string | null }>('/auth/profile', {
      method: 'PATCH', body: JSON.stringify({ profileImage }),
    });
    setProfile((current) => current ? { ...current, profileImage: result.profileImage } : current);
  }

  async function uploadPhoto(file: File, helpers: UploadHelpers) {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      throw new Error('Поддерживаются изображения PNG, JPEG и WebP.');
    }
    if (file.size > 1024 * 1024) throw new Error('Размер изображения должен быть не больше 1 МБ.');
    helpers.onProgress(10);
    const image = await readImage(file, helpers.signal);
    helpers.onProgress(55);
    const result = await api<{ profileImage: string | null }>('/auth/profile', {
      method: 'PATCH', body: JSON.stringify({ profileImage: image }), signal: helpers.signal,
    });
    setProfile((current) => current ? { ...current, profileImage: result.profileImage } : current);
    helpers.onProgress(100);
  }

  async function saveGeneratedAvatar(seed: string) {
    try {
      await saveProfileImage(`kokonut:${seed}`);
      setError('');
      setMediaMode(null);
    } catch {
      setError('Не удалось сохранить аватар. Попробуйте ещё раз.');
    }
  }

  const generatedSeed = profile?.profileImage?.startsWith('kokonut:')
    ? profile.profileImage.slice('kokonut:'.length)
    : undefined;
  const account: Account = {
    id: String(profile?.id ?? 'current-user'),
    name: 'Мой профиль',
    email: profile?.email ?? 'Загружаем профиль…',
    initials: 'Я',
    avatarUrl: profile?.profileImage?.startsWith('data:image/') ? profile.profileImage : undefined,
    avatarSeed: generatedSeed,
  };
  const items: ProfileMenuItem[] = [
    { label: 'Создать аватар', icon: <Sparkles className="size-4" />, onSelect: () => { setError(''); setMediaMode('generated'); } },
    { label: 'Загрузить фото', icon: <ImagePlus className="size-4" />, onSelect: () => { setError(''); setMediaMode('upload'); } },
    ...(profile?.profileImage ? [{ label: 'Удалить фото или аватар', icon: <Trash2 className="size-4" />, onSelect: () => { void saveProfileImage(null); } }] : []),
  ];

  return <>
    <ProfileDropdown
      accounts={[account]}
      defaultAccountId={account.id}
      defaultStatus="online"
      defaultTheme="light"
      holdDuration={500}
      items={items}
      onSignOut={onLogout}
      showStatus={false}
      showTheme={false}
    />
    {mediaMode && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setMediaMode(null); }}>
      <section className="modal kokonut-upload-modal" role="dialog" aria-modal="true" aria-labelledby="avatar-upload-title">
        <button className="modal-close" type="button" onClick={() => setMediaMode(null)} aria-label="Закрыть">×</button>
        <span className="eyebrow">ВАШ ПРОФИЛЬ</span>
        <h2 id="avatar-upload-title">{mediaMode === 'generated' ? 'Создать аватар' : 'Загрузить фото'}</h2>
        <div className="profile-media-tabs" role="tablist" aria-label="Способ выбора изображения">
          <button type="button" role="tab" aria-selected={mediaMode === 'generated'} className={mediaMode === 'generated' ? 'active' : ''} onClick={() => { setError(''); setMediaMode('generated'); }}><Sparkles size={15}/> Создать аватар</button>
          <button type="button" role="tab" aria-selected={mediaMode === 'upload'} className={mediaMode === 'upload' ? 'active' : ''} onClick={() => { setError(''); setMediaMode('upload'); }}><Camera size={15}/> Загрузить фото</button>
        </div>
        {mediaMode === 'generated' ? <AvatarPicker
          defaultValue={{ displayName: profile?.email.split('@')[0] || 'Сотрудник', variant: 0 }}
          description="Введите имя и выберите подходящий образ."
          onComplete={({ seed }) => { void saveGeneratedAvatar(seed); }}
          submitLabel="Сохранить аватар"
          title="Выберите аватар"
        /> : <FileUpload
          acceptedFileTypes={['image/png', 'image/jpeg', 'image/webp']}
          className="kokonut-file-upload"
          maxFileSize={1024 * 1024}
          maxFiles={1}
          multiple={false}
          onUpload={uploadPhoto}
        />}
        {error && <p className="form-error" role="alert">{error}</p>}
      </section>
    </div>}
  </>;
}
