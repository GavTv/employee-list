import type { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { AuthenticatedRequest } from '../shared/http';

type TokenPayload = { userId: number };

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Для доступа необходимо войти в аккаунт' });
    return;
  }
  try {
    const payload = jwt.verify(authorization.slice(7), env.jwtSecret) as TokenPayload;
    if (!Number.isInteger(payload.userId)) throw new Error('Invalid token payload');
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Сессия истекла. Войдите ещё раз.' });
  }
}
