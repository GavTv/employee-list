import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { asyncHandler } from '../../shared/asyncHandler';
import * as employeesController from './employees.controller';

export const employeesRouter = Router();
employeesRouter.use(authenticate);
employeesRouter.get('/', asyncHandler(employeesController.listEmployees));
employeesRouter.post('/', asyncHandler(employeesController.addEmployee));

export const departmentsRouter = Router();
departmentsRouter.use(authenticate);
departmentsRouter.get('/', asyncHandler(employeesController.listDepartments));
