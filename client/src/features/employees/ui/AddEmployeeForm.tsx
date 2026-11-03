import { useState, type FormEvent } from 'react';

import styles from './AddEmployeeForm.module.css';
import { cn } from '@/shared/lib/cn';
import type { CreateEmployeePayload } from '@/entities/employee';

export function AddEmployeeForm({ onSubmit, onClose }: { onSubmit: (payload: CreateEmployeePayload) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<CreateEmployeePayload>({ fullName: '', position: '', department: '' });
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  function update(field: keyof CreateEmployeePayload, value: string) { setForm((current) => ({ ...current, [field]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('');
    try { await onSubmit(form); onClose(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Не удалось сохранить сотрудника'); }
    finally { setSaving(false); }
  }
  return <div className={styles.modalBackdrop} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className={styles.modalClose} onClick={onClose} aria-label="Закрыть">×</button><span className="eyebrow">НОВЫЙ ПРОФИЛЬ</span><h2 id="modal-title">Добавить сотрудника</h2><p className={styles.modalSubtitle}>Заполните данные, чтобы добавить человека в команду.</p>
      <form className={styles.employeeForm} onSubmit={submit}>
        <label className="field-label" htmlFor="fullName">ФИО</label><input id="fullName" placeholder="Например, Анна Смирнова" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required maxLength={120} autoFocus />
        <label className="field-label" htmlFor="position">Должность</label><input id="position" placeholder="Например, дизайнер продукта" value={form.position} onChange={(e) => update('position', e.target.value)} required maxLength={120} />
        <label className="field-label" htmlFor="department">Отдел</label><input id="department" placeholder="Например, Дизайн" value={form.department} onChange={(e) => update('department', e.target.value)} required maxLength={80} />
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className={styles.modalActions}><button type="button" className={cn("button", styles.buttonSecondary)} onClick={onClose}>Отмена</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Сохраняем…' : 'Добавить сотрудника'}</button></div>
      </form>
    </section>
  </div>;
}
