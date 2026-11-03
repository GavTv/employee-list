import { useEffect, useRef } from 'react';

type Props = { query: string; onQueryChange: (value: string) => void; department: string; departments: string[]; onDepartmentChange: (value: string) => void; onAdd: () => void };

export function EmployeeToolbar(props: Props) {
  const searchRef = useRef<HTMLInputElement>(null);
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

  return <div className="toolbar">
    <label className="search-box"><span className="search-icon" aria-hidden="true">⌕</span><input ref={searchRef} type="search" placeholder="Найти сотрудника" value={props.query} onChange={(e) => props.onQueryChange(e.target.value)} aria-label="Поиск по ФИО" /><kbd>⌘ K</kbd></label>
    <label className="filter-box"><span className="filter-label">Отдел</span><select value={props.department} onChange={(e) => props.onDepartmentChange(e.target.value)} aria-label="Фильтр по отделу"><option value="">Все отделы</option>{props.departments.map((item) => <option key={item}>{item}</option>)}</select><span className="select-chevron">⌄</span></label>
    <button className="button button-primary add-button" type="button" onClick={props.onAdd}><span>＋</span> Добавить</button>
  </div>;
}
