export const MISSION_CATEGORIES = [
  'nature',
  'exploration',
  'connection',
  'solitude',
  'movement',
  'creation',
  'sensation',
  'declutter',
] as const;

export type MissionCategory = (typeof MISSION_CATEGORIES)[number];
