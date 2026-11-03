import type { Request, Response } from 'express';
import * as employeesService from './employees.service';

export function listEmployees(req: Request, res: Response) {
  const employees = employeesService.listEmployees(
    req.query.q,
    req.query.department,
  );

  return res.json({ employees });
}

export function listDepartments(_req: Request, res: Response) {
  const departments = employeesService.listDepartments();
  return res.json({ departments });
}

export function addEmployee(req: Request, res: Response) {
  const result = employeesService.addEmployee(req.body);

  if (!result.ok) {
    return res.status(result.status).json({ message: result.message });
  }

  return res.status(201).json({ employee: result.value });
}
