import { useEffect, useState } from 'react';
import { Camera, ImagePlus, Sparkles, Trash2 } from 'lucide-react';
import ProfileDropdown, { type Account, type ProfileMenuItem } from '@/components/kokonutui/profile-dropdown';
import AvatarPicker from '@/components/kokonutui/avatar-picker';
import FileUpload, { type UploadHelpers } from '@/components/kokonutui/file-upload';
import { userApi, type UserProfile } from '@/entities/user';
import { cn } from '@/shared/lib/cn';
import styles from './ProfileMenu.module.css';

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
    userApi.current().then(({ user }) => setProfile(user)).catch(() => undefined);
  }, []);

  async function saveProfileImage(profileImage: string | null) {
    const result = await userApi.updateProfileImage(profileImage);
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
    const result = await userApi.updateProfileImage(image, helpers.signal);
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
      compactTrigger
      className={styles.profileMenuRoot}
      holdDuration={500}
      items={items}
      onSignOut={onLogout}
      showStatus={false}
      showTheme={false}
    />
    {mediaMode && <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setMediaMode(null); }}>
      <section className={`${styles.modal} ${styles.kokonutUploadModal}`} role="dialog" aria-modal="true" aria-labelledby="avatar-upload-title">
        <button className={styles.modalClose} type="button" onClick={() => setMediaMode(null)} aria-label="Закрыть">×</button>
        <span className="eyebrow">ВАШ ПРОФИЛЬ</span>
        <h2 id="avatar-upload-title">{mediaMode === 'generated' ? 'Создать аватар' : 'Загрузить фото'}</h2>
        <div className={styles.profileMediaTabs} role="tablist" aria-label="Способ выбора изображения">
        <button type="button" role="tab" aria-selected={mediaMode === 'generated'} className={cn(styles.profileMediaTab, mediaMode === 'generated' && styles.active)} onClick={() => { setError(''); setMediaMode('generated'); }}><Sparkles size={15}/> Создать аватар</button>
        <button type="button" role="tab" aria-selected={mediaMode === 'upload'} className={cn(styles.profileMediaTab, mediaMode === 'upload' && styles.active)} onClick={() => { setError(''); setMediaMode('upload'); }}><Camera size={15}/> Загрузить фото</button>
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
        {error && <p className={`form-error ${styles.error}`} role="alert">{error}</p>}
      </section>
    </div>}
  </>;
}
