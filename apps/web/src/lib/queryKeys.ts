export const queryKeys = {
  missions: {
    today: () => ['missions', 'today'] as const,
  },
  reviews: {
    detail: (missionDrawId: string) =>
      ['reviews', 'detail', missionDrawId] as const,
  },
};
