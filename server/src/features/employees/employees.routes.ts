import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as employeesController from './employees.controller';

export const employeesRouter = Router();
employeesRouter.use(authenticate);
employeesRouter.get('/', employeesController.listEmployees);
employeesRouter.post('/', employeesController.addEmployee);

export const departmentsRouter = Router();
departmentsRouter.use(authenticate);
departmentsRouter.get('/', employeesController.listDepartments);
