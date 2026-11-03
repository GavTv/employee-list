import { Router } from 'express';
import { db } from '../../db/database';
import { authenticate } from '../../middleware/authenticate';
import type { AuthenticatedRequest, EmployeeRow } from '../../shared/http';
import { toEmployee } from '../../shared/http';

export const employeesRouter = Router();
employeesRouter.use(authenticate);

export const departmentsRouter = Router();
departmentsRouter.use(authenticate);
departmentsRouter.get('/', (_req, res) => {
  const rows = db.prepare('SELECT DISTINCT department FROM employees ORDER BY department COLLATE NOCASE').all() as { department: string }[];
  return res.json({ departments: rows.map((row) => row.department) });
});

employeesRouter.get('/', (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const department = typeof req.query.department === 'string' ? req.query.department.trim() : '';
  const rows = db.prepare(`
    SELECT id, full_name, position, department, created_at FROM employees
    WHERE (? = '' OR full_name LIKE ? COLLATE NOCASE)
      AND (? = '' OR department = ? COLLATE NOCASE)
    ORDER BY full_name COLLATE NOCASE ASC
  `).all(query, `%${query}%`, department, department) as EmployeeRow[];
  return res.json({ employees: rows.map(toEmployee) });
});

employeesRouter.post('/', (req: AuthenticatedRequest, res) => {
  const fields = ['fullName', 'position', 'department'] as const;
  const values = fields.map((field) => typeof req.body[field] === 'string' ? req.body[field].trim() : '');
  if (values.some((value) => !value)) return res.status(400).json({ message: 'Заполните все обязательные поля' });
  if (values[0].length > 120 || values[1].length > 120 || values[2].length > 80) return res.status(400).json({ message: 'Превышена допустимая длина поля' });
  const result = db.prepare('INSERT INTO employees (full_name, position, department) VALUES (?, ?, ?)').run(...values);
  const employee = db.prepare('SELECT id, full_name, position, department, created_at FROM employees WHERE id = ?').get(result.lastInsertRowid) as EmployeeRow;
  return res.status(201).json({ employee: toEmployee(employee) });
});
