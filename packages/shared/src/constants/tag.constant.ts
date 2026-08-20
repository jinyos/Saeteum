export const EMOTION_TAGS = [
  'excitement',
  'joy',
  'pride',
  'gratitude',
  'curiosity',
  'relief',
  'freshness',
  'indifference',
  'awkwardness',
  'regret',
] as const;

export type EmotionTag = (typeof EMOTION_TAGS)[number];

export const MAX_REVIEW_TAGS = 3;
