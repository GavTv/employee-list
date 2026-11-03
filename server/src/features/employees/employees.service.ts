import * as employeesRepository from './employees.repository';

type NewEmployee = {
  fullName: string;
  position: string;
  department: string;
};

type AddEmployeeResult =
  | { ok: true; value: ReturnType<typeof employeesRepository.createEmployee> }
  | { ok: false; status: 400; message: string };

function readText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function listEmployees(queryValue: unknown, departmentValue: unknown) {
  return employeesRepository.findEmployees(
    readText(queryValue),
    readText(departmentValue),
  );
}

export function listDepartments() {
  return employeesRepository.findDepartments();
}

export function addEmployee(body: unknown): AddEmployeeResult {
  const payload =
    typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>)
      : {};
  const employee: NewEmployee = {
    fullName: readText(payload.fullName),
    position: readText(payload.position),
    department: readText(payload.department),
  };
  const values = Object.values(employee);

  if (values.some((value) => !value)) {
    return {
      ok: false,
      status: 400,
      message: 'Заполните все обязательные поля',
    };
  }

  if (
    employee.fullName.length > 120 ||
    employee.position.length > 120 ||
    employee.department.length > 80
  ) {
    return {
      ok: false,
      status: 400,
      message: 'Превышена допустимая длина поля',
    };
  }

  return { ok: true, value: employeesRepository.createEmployee(employee) };
}
