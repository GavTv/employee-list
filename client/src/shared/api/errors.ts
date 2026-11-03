import { ApiError } from './client';

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Не удалось выполнить запрос. Проверьте подключение и попробуйте ещё раз.';
}
