import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../db/database';
import { env } from '../../config/env';
import { authenticate } from '../../middleware/authenticate';
import type { AuthenticatedRequest } from '../../shared/http';

export const authRouter = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function issueToken(userId: number) {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: '7d' });
}

authRouter.post('/register', async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!emailPattern.test(email) || email.length > 254) return res.status(400).json({ message: 'Введите корректный email' });
  if (password.length < 8 || password.length > 72) return res.status(400).json({ message: 'Пароль должен содержать от 8 до 72 символов' });

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ message: 'Аккаунт с таким email уже существует' });
  const passwordHash = await bcrypt.hash(password, 12);
  const result = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, passwordHash);
  return res.status(201).json({ token: issueToken(Number(result.lastInsertRowid)) });
});

authRouter.post('/login', async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const user = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(email) as { id: number; password_hash: string } | undefined;
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ message: 'Неверный email или пароль' });
  return res.json({ token: issueToken(user.id) });
});

authRouter.get('/me', authenticate, (req: AuthenticatedRequest, res) => {
  const user = db.prepare('SELECT id, email, profile_image AS profileImage FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(401).json({ message: 'Пользователь не найден' });
  return res.json({ user });
});

authRouter.patch('/profile', authenticate, (req: AuthenticatedRequest, res) => {
  const profileImage: unknown = req.body.profileImage;
  if (profileImage !== null && (typeof profileImage !== 'string' || profileImage.length > 1_500_000 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(profileImage))) {
    return res.status(400).json({ message: 'Загрузите изображение PNG, JPEG или WebP размером до 1 МБ' });
  }
  db.prepare('UPDATE users SET profile_image = ? WHERE id = ?').run(profileImage, req.userId);
  return res.json({ profileImage });
});
