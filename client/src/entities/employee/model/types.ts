export type Employee = { id: number; fullName: string; position: string; department: string; createdAt: string };
export type CreateEmployeePayload = Pick<Employee, 'fullName' | 'position' | 'department'>;
