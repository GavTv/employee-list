import type { Employee } from '../model/types';

import styles from './EmployeeCard.module.css';

const initials = (name: string) => name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();

export function EmployeeCard({ employee, index }: { employee: Employee; index: number }) {
  return <article className={styles.employeeCard} data-employee-card>
    <div className={styles.cardTop}>
      <span className={styles.rowIndex}>{String(index).padStart(2, '0')} / СОТРУДНИК</span>
      <span className={styles.avatar} aria-hidden="true">{initials(employee.fullName)}</span>
    </div>
    <h3>{employee.fullName}</h3>
    <span className={styles.employeePosition}>{employee.position}</span>
    <div className={styles.cardBottom}><span className={styles.departmentLabel}>ОТДЕЛ</span><span className={styles.departmentPill}>{employee.department}</span></div>
  </article>;
}
