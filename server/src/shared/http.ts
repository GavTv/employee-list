import type { Request } from 'express';

export type AuthenticatedRequest = Request & { userId?: number };
export type EmployeeRow = { id: number; full_name: string; position: string; department: string; created_at: string };
export function toEmployee(row: EmployeeRow) {
  return { id: row.id, fullName: row.full_name, position: row.position, department: row.department, createdAt: row.created_at };
}
