import type { Request, Response } from 'express';
import * as employeesService from './employees.service';

export async function listEmployees(req: Request, res: Response) {
  const employees = await employeesService.listEmployees(
    req.query.q,
    req.query.department,
  );

  return res.json({ employees });
}

export async function listDepartments(_req: Request, res: Response) {
  const departments = await employeesService.listDepartments();
  return res.json({ departments });
}

export async function addEmployee(req: Request, res: Response) {
  const result = await employeesService.addEmployee(req.body);

  if (!result.ok) {
    return res.status(result.status).json({ message: result.message });
  }

  return res.status(201).json({ employee: result.value });
}
