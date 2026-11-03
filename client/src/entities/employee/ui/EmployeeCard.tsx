import type { Employee } from '../model/types';

const initials = (name: string) => name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();

export function EmployeeCard({ employee, index }: { employee: Employee; index: number }) {
  return <article className="employee-card" style={{ animationDelay: `${index * 45}ms` }}>
    <div className="avatar" aria-hidden="true">{initials(employee.fullName)}</div>
    <div className="employee-main"><h3>{employee.fullName}</h3><p>{employee.position}</p></div>
    <span className="department-pill">{employee.department}</span>
  </article>;
}
