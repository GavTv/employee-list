import { api } from '../../../shared/api/client';
import type { CreateEmployeePayload, Employee } from '../model/types';

export const employeeApi = {
  list: (query: string, department: string) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (department) params.set('department', department);
    return api<{ employees: Employee[] }>(`/employees?${params.toString()}`);
  },
  departments: () => api<{ departments: string[] }>('/departments'),
  create: (payload: CreateEmployeePayload) => api<{ employee: Employee }>('/employees', { method: 'POST', body: JSON.stringify(payload) }),
};
