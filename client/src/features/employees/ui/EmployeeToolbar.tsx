import { useEffect, useRef } from 'react';

import styles from './EmployeeToolbar.module.css';
import { ChevronDown } from 'lucide-react';

type Props = { query: string; onQueryChange: (value: string) => void; department: string; departments: string[]; onDepartmentChange: (value: string) => void };

export function EmployeeToolbar(props: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
  const departmentSelectRef = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  return <div className={styles.toolbar}>
    <label className={styles.searchBox}><span className={styles.searchIcon} aria-hidden="true">⌕</span><input ref={searchRef} type="search" placeholder="Поиск по ФИО" value={props.query} onChange={(e) => props.onQueryChange(e.target.value)} aria-label="Поиск по ФИО" /><kbd>⌘ K</kbd></label>
    <div className={styles.filterBox}><label className={styles.filterLabel} htmlFor="department-filter">Отдел</label><span className={styles.filterValue} aria-hidden="true">{props.department || 'Все отделы'}</span><select id="department-filter" ref={departmentSelectRef} value={props.department} onChange={(e) => props.onDepartmentChange(e.target.value)} aria-label="Фильтр по отделу"><option value="">Все отделы</option>{props.departments.map((item) => <option key={item}>{item}</option>)}</select><span className={styles.selectChevron} aria-hidden="true"><ChevronDown size={14} strokeWidth={1.8} /></span></div>
  </div>;
}
