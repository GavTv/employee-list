import { findMany, findOne, insertId } from '../../db/database';

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

export async function findEmployees(
  query: string,
  department: string,
): Promise<EmployeeRecord[]> {
  const rows = await findMany<EmployeeRow>(
    `
      SELECT id, full_name, position, department, created_at
      FROM employees
      WHERE (? = '' OR LOWER(full_name) LIKE LOWER(?))
        AND (? = '' OR LOWER(department) = LOWER(?))
      ORDER BY LOWER(full_name) ASC
    `,
    [query, `%${query}%`, department, department],
  );

  return rows.map(toEmployee);
}

export async function findDepartments(): Promise<string[]> {
  const rows = await findMany<{ department: string }>(
    `SELECT department
     FROM (SELECT DISTINCT department FROM employees) AS departments
     ORDER BY LOWER(department) ASC`,
  );

  return rows.map((row) => row.department);
}

export async function createEmployee(employee: NewEmployee): Promise<EmployeeRecord> {
  const id = await insertId(
    `INSERT INTO employees (full_name, position, department)
     VALUES (?, ?, ?) RETURNING id`,
    [employee.fullName, employee.position, employee.department],
  );
  const row = await findOne<EmployeeRow>(
    'SELECT id, full_name, position, department, created_at FROM employees WHERE id = ?',
    [id],
  );

  if (!row) throw new Error('Не удалось сохранить сотрудника');
  return toEmployee(row);
}
