import { api } from '../../../shared/api/client';
import type { UserProfile } from '../model/types';

export const userApi = {
  current: () => api<{ user: UserProfile }>('/auth/me'),
  updateProfileImage: (profileImage: string | null, signal?: AbortSignal) =>
    api<{ profileImage: string | null }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ profileImage }),
      signal,
    }),
};
