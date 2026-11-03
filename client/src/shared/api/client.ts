import { getToken } from './token';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); this.name = 'ApiError'; }
}

export async function api<T>(path: string, init: RequestInit = {}, options: { requiresAuth?: boolean } = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token && options.requiresAuth !== false) headers.set('Authorization', `Bearer ${token}`);
  const timeoutController = new AbortController();
  const timeoutId = window.setTimeout(() => timeoutController.abort(), 15_000);

  try {
    const response = await fetch(`${apiBaseUrl}/api${path}`, {
      ...init,
      headers,
      signal: init.signal ?? timeoutController.signal,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(result.message || 'Произошла ошибка', response.status);
    return result as T;
  } catch (error) {
    if (timeoutController.signal.aborted) {
      throw new ApiError('Сервер долго не отвечает. Попробуйте ещё раз.', 0);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
