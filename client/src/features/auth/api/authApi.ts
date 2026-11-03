import { api } from '../../../shared/api/client';

export type AuthMode = 'login' | 'register';

export const authApi = {
  authenticate: (mode: AuthMode, credentials: { email: string; password: string }) =>
    api<{ token: string }>(`/auth/${mode}`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
};
