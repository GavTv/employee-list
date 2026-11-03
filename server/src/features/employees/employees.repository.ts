import { db } from '../../db/database';

type EmployeeRow = {
  id: number;
  full_name: string;
  position: string;
  department: string;
  created_at: string;
};

type EmployeeRecord = {
  id: number;
  fullName: string;
  position: string;
  department: string;
  createdAt: string;
};

type NewEmployee = Omit<EmployeeRecord, 'id' | 'createdAt'>;

function toEmployee(row: EmployeeRow): EmployeeRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    position: row.position,
    department: row.department,
    createdAt: row.created_at,
  };
}

export function findEmployees(
  query: string,
  department: string,
): EmployeeRecord[] {
  const rows = db
    .prepare(
      `
        SELECT id, full_name, position, department, created_at
        FROM employees
        WHERE (? = '' OR full_name LIKE ? COLLATE NOCASE)
          AND (? = '' OR department = ? COLLATE NOCASE)
        ORDER BY full_name COLLATE NOCASE ASC
      `,
    )
    .all(query, `%${query}%`, department, department) as EmployeeRow[];

  return rows.map(toEmployee);
}

export function findDepartments(): string[] {
  const rows = db
    .prepare(
      'SELECT DISTINCT department FROM employees ORDER BY department COLLATE NOCASE',
    )
    .all() as { department: string }[];

  return rows.map((row) => row.department);
}

export function createEmployee(employee: NewEmployee): EmployeeRecord {
  const result = db
    .prepare(
      'INSERT INTO employees (full_name, position, department) VALUES (?, ?, ?)',
    )
    .run(employee.fullName, employee.position, employee.department);
  const row = db
    .prepare(
      'SELECT id, full_name, position, department, created_at FROM employees WHERE id = ?',
    )
    .get(result.lastInsertRowid) as EmployeeRow;

  return toEmployee(row);
}
