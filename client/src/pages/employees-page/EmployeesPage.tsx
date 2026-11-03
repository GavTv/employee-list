import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, createScope, stagger } from 'animejs';
import { ArrowUpRight, Plus, UsersRound } from 'lucide-react';
import { cn } from '../../shared/lib/cn';
import { employeeApi, EmployeeCard, type CreateEmployeePayload, type Employee } from '../../entities/employee';
import { AddEmployeeForm, EmployeeToolbar } from '../../features/employees';
import { Header } from '../../widgets/header';
import { getErrorMessage } from '../../shared/api/errors';
import { ApiError } from '../../shared/api/client';
import styles from './EmployeesPage.module.css';

const INITIAL_DEPARTMENTS = ['Аналитика', 'Дизайн', 'Маркетинг', 'Продукт', 'Разработка'];

export function EmployeesPage({ onLogout }: { onLogout: () => void }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>(INITIAL_DEPARTMENTS);
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const employeeListRef = useRef<HTMLDivElement>(null);

  const loadEmployees = useCallback(async () => {
    try {
      const { employees: results } = await employeeApi.list(query, department);
      setEmployees(results);
      setError('');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) onLogout();
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query, department, onLogout]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLoading(true);
      void loadEmployees();
    }, 180);
    return () => window.clearTimeout(timeout);
  }, [loadEmployees]);

  useEffect(() => {
    employeeApi.departments().then(({ departments: list }) => setDepartments(list)).catch(() => undefined);
  }, [employees.length]);

  useEffect(() => {
    if (loading || !employeeListRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const scope = createScope({ root: employeeListRef }).add(() => {
      animate('[data-employee-card]', { opacity: [0, 1], y: [12, 0], delay: stagger(45), duration: 420, ease: 'out(3)' });
    });
    return () => scope.revert();
  }, [employees, loading]);

  const addEmployee = async (payload: CreateEmployeePayload) => {
    await employeeApi.create(payload);
    await loadEmployees();
  };

  const departmentOptions = departments.length
    ? departments
    : [...new Set(employees.map((employee) => employee.department))].sort((a, b) => a.localeCompare(b, 'ru'));
  const visibleCount = employees.length;

  return <div className={styles.appShell}>
    <Header onLogout={onLogout} />
    <main className={styles.contentWrap}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.heroKicker}>ПРОСТРАНСТВО КОМАНДЫ <i>·</i> 001</span>
          <h1>Знакомьтесь,<br /><strong>это команда.</strong></h1>
          <p>Люди, роли и отделы — собраны в одном месте.</p>
          <a href="#directory" className={styles.heroLink}>Перейти к справочнику <ArrowUpRight size={15} /></a>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.statTile}><UsersRound size={17} /><span>СОТРУДНИКИ</span><strong>{String(visibleCount).padStart(2, '0')}</strong></div>
          <div className={styles.statTile}><span>ОТДЕЛЫ</span><strong>{String(departmentOptions.length).padStart(2, '0')}</strong><i>в справочнике</i></div>
          <div className={styles.heroStamp}>КОМАНДА<br />В ФОКУСЕ <b>✳</b></div>
        </div>
      </section>

      <section className={styles.directoryPanel} id="directory" aria-label="Справочник сотрудников">
        <header className={styles.directoryHeader}>
          <div className={styles.directoryHeading}>
            <span className={styles.directoryIndex}>01 <i>/</i> КАТАЛОГ</span>
            <h2>Люди в команде</h2>
          </div>
          <button className={styles.addButton} type="button" aria-label="Добавить человека" onClick={() => setShowAdd(true)}><Plus size={16} /><span className={styles.addButtonFull}>Добавить человека</span><span className={styles.addButtonShort}>Добавить</span><ArrowUpRight size={14} /></button>
        </header>

        <EmployeeToolbar query={query} onQueryChange={setQuery} department={department} departments={departmentOptions} onDepartmentChange={setDepartment} />
        <div className={styles.resultLine}><span>{query || department ? 'РЕЗУЛЬТАТЫ ПОИСКА' : 'ВСЯ КОМАНДА'}</span><span>{String(visibleCount).padStart(2, '0')} <i>УЧАСТНИКОВ</i></span></div>
        {loading
          ? <div className={styles.listState}><span className="spinner" />Загружаем состав…</div>
          : error
            ? <div className={cn(styles.listState, styles.errorState)}><p>{error}</p><button className="text-button" onClick={() => void loadEmployees()}>Попробовать ещё раз</button></div>
            : visibleCount
              ? <div className={styles.employeeList} ref={employeeListRef}>{employees.map((employee, index) => <EmployeeCard employee={employee} index={index + 1} key={employee.id} />)}</div>
              : <div className={styles.emptyState}><span className={styles.emptyIndex}>00 / ПОКА ПУСТО</span><h3>Добавим первого?</h3><p>{query || department ? 'Измените запрос или фильтр — список обновится.' : 'Добавьте участника команды в справочник.'}</p></div>}
      </section>
      <footer className={styles.pageFooter}><span>СОСТАВ / 001</span><span>СПРАВОЧНИК КОМАНДЫ <i>·</i> {departmentOptions.length} ОТДЕЛОВ</span></footer>
    </main>
    {showAdd && <AddEmployeeForm onSubmit={addEmployee} onClose={() => setShowAdd(false)} />}
  </div>;
}
