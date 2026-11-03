import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../shared/http';
import * as authService from './auth.service';

export async function register(req: AuthenticatedRequest, res: Response) {
  const result = await authService.register(req.body?.email, req.body?.password);

  if (!result.ok) {
    return res.status(result.status).json({ message: result.message });
  }

  return res.status(201).json({ token: result.value.token });
}

export async function login(req: AuthenticatedRequest, res: Response) {
  const result = await authService.login(req.body?.email, req.body?.password);

  if (!result.ok) {
    return res.status(result.status).json({ message: result.message });
  }

  return res.json({ token: result.value.token });
}

export function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  const user = authService.getCurrentUser(req.userId!);

  if (!user) {
    return res.status(401).json({ message: 'Пользователь не найден' });
  }

  return res.json({ user });
}

export function updateProfile(req: AuthenticatedRequest, res: Response) {
  const profileImage: unknown = req.body?.profileImage;
  const result = authService.updateProfileImage(req.userId!, profileImage);

  if (!result.ok) {
    return res.status(result.status).json({ message: result.message });
  }

  return res.json({ profileImage: result.value.profileImage });
}
