import type { Provider } from '@saeteum/shared';
import { authorizedFetch } from '@/lib/auth/authorizedFetch';

export interface Me {
  id: string;
  nickname: string;
  provider: Provider;
  createdAt: string;
}

export function getMe(): Promise<Me> {
  return authorizedFetch<Me>('/me');
}

export function updateNickname(nickname: string): Promise<Me> {
  return authorizedFetch<Me>('/me', {
    method: 'PATCH',
    body: JSON.stringify({ nickname }),
  });
}

export function deleteMe(): Promise<void> {
  return authorizedFetch<void>('/me', {
    method: 'DELETE',
  });
}
