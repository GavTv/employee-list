import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmployeeCard } from '../../entities/employee/ui/EmployeeCard';
import { employeeApi } from '../../entities/employee/api/employeeApi';
import type { CreateEmployeePayload, Employee } from '../../entities/employee/model/types';
import { AddEmployeeForm } from '../../features/employees/ui/AddEmployeeForm';
import { EmployeeToolbar } from '../../features/employees/ui/EmployeeToolbar';
import { Header } from '../../widgets/header/Header';
import { getErrorMessage } from '../../shared/api/errors';
import { ApiError } from '../../shared/api/client';

export function EmployeesPage({ onLogout }: { onLogout: () => void }) {
  const [employees, setEmployees] = useState<Employee[]>([]); const [departments, setDepartments] = useState<string[]>([]);
  const [query, setQuery] = useState(''); const [department, setDepartment] = useState(''); const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const loadEmployees = useCallback(async () => {
    try { const { employees: results } = await employeeApi.list(query, department); setEmployees(results); setError(''); }
    catch (err) { if (err instanceof ApiError && err.status === 401) onLogout(); setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, [query, department, onLogout]);
  useEffect(() => { const timeout = window.setTimeout(() => { setLoading(true); void loadEmployees(); }, 180); return () => window.clearTimeout(timeout); }, [loadEmployees]);
  useEffect(() => { employeeApi.departments().then(({ departments: list }) => setDepartments(list)).catch(() => undefined); }, [employees.length]);
  const addEmployee = async (payload: CreateEmployeePayload) => { await employeeApi.create(payload); await loadEmployees(); };
  const visibleCount = employees.length;
  const departmentCount = useMemo(() => departments.length, [departments]);

  return <div className="app-shell"><Header onLogout={onLogout} /><main className="content-wrap">
    <div className="page-heading"><div><div className="breadcrumbs">Рабочее пространство <span>/</span> Команда</div><h1>Сотрудники</h1><p>Люди, которые двигают нас вперёд.</p></div><div className="member-count"><span className="count-number">{visibleCount}</span><span>сотрудников<br/>в списке</span></div></div>
    <section className="directory-panel"><div className="directory-heading"><div><h2>Вся команда <span className="total-count">{visibleCount}</span></h2><p>Управляйте участниками и их профилями</p></div><div className="department-total"><span className="mini-icon">▦</span> {departmentCount} отделов</div></div>
      <EmployeeToolbar query={query} onQueryChange={setQuery} department={department} departments={departments} onDepartmentChange={setDepartment} onAdd={() => setShowAdd(true)} />
      <div className="list-header"><span>СОТРУДНИК</span><span>ОТДЕЛ</span></div>
      {loading ? <div className="list-state"><span className="spinner"/>Загружаем команду…</div> : error ? <div className="list-state error-state"><p>{error}</p><button className="text-button" onClick={() => void loadEmployees()}>Попробовать ещё раз</button></div> : employees.length ? <div className="employee-list">{employees.map((employee, index) => <EmployeeCard employee={employee} index={index} key={employee.id}/>)}</div> : <div className="empty-state"><div className="empty-icon">⌕</div><h3>Никого не нашли</h3><p>{query || department ? 'Попробуйте изменить запрос или фильтр.' : 'Добавьте первого сотрудника в команду.'}</p></div>}
      <div className="directory-footer"><span>Обновлено только что</span><span>Показываем {visibleCount} из {visibleCount}</span></div>
    </section><footer className="page-footer"><span>© 2026 Команда</span><span className="footer-status"><i/> Все данные сохранены</span></footer>
  </main>{showAdd && <AddEmployeeForm onSubmit={addEmployee} onClose={() => setShowAdd(false)} />}</div>;
}
