import type { MissionCategory } from '@saeteum/shared';

export const queryKeys = {
  me: {
    detail: () => ['me'] as const,
  },
  missions: {
    today: () => ['missions', 'today'] as const,
  },
  stats: {
    summary: () => ['stats', 'summary'] as const,
  },
  reviews: {
    detail: (missionDrawId: string) =>
      ['reviews', 'detail', missionDrawId] as const,
  },
  records: {
    category: (category: MissionCategory) =>
      ['records', 'category', category] as const,
    mission: (missionId: number) => ['records', 'mission', missionId] as const,
  },
};
