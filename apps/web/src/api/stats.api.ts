import type { EmotionTag, MissionCategory } from '@saeteum/shared';
import { authorizedFetch } from '@/lib/auth/authorizedFetch';

export interface CategoryDistributionItem {
  category: MissionCategory;
  count: number;
}

export interface EmotionTagFrequencyItem {
  tag: EmotionTag;
  count: number;
}

export interface StatsSummary {
  totalDraws: number;
  totalReviews: number;
  reviewRate: number;
  categoryDistribution: CategoryDistributionItem[];
  emotionTagFrequency: EmotionTagFrequencyItem[];
  averageRating: number | null;
}

export function getStats(): Promise<StatsSummary> {
  return authorizedFetch<StatsSummary>('/stats');
}
