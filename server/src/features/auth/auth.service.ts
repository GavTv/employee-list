import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import * as authRepository from './auth.repository';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ServiceError = { ok: false; status: 400 | 401 | 409; message: string };
type ServiceSuccess<T> = { ok: true; value: T };
type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

function error(status: ServiceError['status'], message: string): ServiceError {
  return { ok: false, status, message };
}

function issueToken(userId: number): string {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: '7d' });
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const email = value.trim().toLowerCase();
  return emailPattern.test(email) && email.length <= 254 ? email : null;
}

export async function register(
  emailValue: unknown,
  passwordValue: unknown,
): Promise<ServiceResult<{ token: string }>> {
  const email = normalizeEmail(emailValue);
  const password = typeof passwordValue === 'string' ? passwordValue : '';

  if (!email) {
    return error(400, 'Введите корректный email');
  }

  if (password.length < 8 || password.length > 72) {
    return error(400, 'Пароль должен содержать от 8 до 72 символов');
  }

  if (await authRepository.findUserIdByEmail(email)) {
    return error(409, 'Аккаунт с таким email уже существует');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = await authRepository.createUser(email, passwordHash);

  return { ok: true, value: { token: issueToken(userId) } };
}

export async function login(
  emailValue: unknown,
  passwordValue: unknown,
): Promise<ServiceResult<{ token: string }>> {
  const email = normalizeEmail(emailValue) ?? '';
  const password = typeof passwordValue === 'string' ? passwordValue : '';
  const user = await authRepository.findUserForLogin(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return error(401, 'Неверный email или пароль');
  }

  return { ok: true, value: { token: issueToken(user.id) } };
}

export function getCurrentUser(userId: number) {
  return authRepository.findProfileById(userId);
}

export async function updateProfileImage(
  userId: number,
  profileImage: unknown,
): Promise<ServiceResult<{ profileImage: string | null }>> {
  const generatedAvatar =
    typeof profileImage === 'string' &&
    profileImage.startsWith('kokonut:') &&
    profileImage.length <= 200;
  const uploadedImage =
    typeof profileImage === 'string' &&
    profileImage.length <= 1_500_000 &&
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(profileImage);

  if (profileImage !== null && !generatedAvatar && !uploadedImage) {
    return error(
      400,
      'Загрузите изображение PNG, JPEG или WebP размером до 1 МБ',
    );
  }

  const image = profileImage as string | null;
  await authRepository.updateProfileImage(userId, image);

  return { ok: true, value: { profileImage: image } };
}
