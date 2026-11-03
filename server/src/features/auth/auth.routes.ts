import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { asyncHandler } from '../../shared/asyncHandler';
import * as authController from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(authController.register));
authRouter.post('/login', asyncHandler(authController.login));
authRouter.get('/me', authenticate, asyncHandler(authController.getCurrentUser));
authRouter.patch('/profile', authenticate, asyncHandler(authController.updateProfile));
