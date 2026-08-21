import { Injectable } from '@nestjs/common';
import { missionCategoryEnum } from '@/db/schema';
import { EMOTION_TAGS, EmotionTag } from '@saeteum/shared';
import {
  CategoryDrawCount,
  ReviewStatsRow,
  StatsRepository,
} from './repositories/stats.repository';

export type TagCount = { tag: EmotionTag; count: number };

export type StatsSummary = {
  totalDraws: number;
  totalReviews: number;
  reviewRate: number;
  categoryDistribution: CategoryDrawCount[];
  emotionTagFrequency: TagCount[];
  averageRating: number | null;
};

function roundToDecimals(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

@Injectable()
export class StatsService {
  constructor(private readonly statsRepository: StatsRepository) {}

  async getSummary(userId: string): Promise<StatsSummary> {
    const [totalDraws, categoryCounts, reviewRows] = await Promise.all([
      this.statsRepository.countDraws(userId),
      this.statsRepository.getDrawCountsByCategory(userId),
      this.statsRepository.getReviewStatsRows(userId),
    ]);

    const totalReviews = reviewRows.length;

    return {
      totalDraws,
      totalReviews,
      reviewRate: this.calculateReviewRate(totalDraws, totalReviews),
      categoryDistribution: this.buildCategoryDistribution(categoryCounts),
      emotionTagFrequency: this.buildEmotionTagFrequency(reviewRows),
      averageRating: this.calculateAverageRating(reviewRows),
    };
  }

  private calculateReviewRate(totalDraws: number, totalReviews: number) {
    return totalDraws === 0 ? 0 : roundToDecimals(totalReviews / totalDraws, 2);
  }

  private calculateAverageRating(reviewRows: ReviewStatsRow[]) {
    const ratings = reviewRows
      .map((row) => row.rating)
      .filter((rating): rating is number => rating !== null);

    if (ratings.length === 0) {
      return null;
    }

    const sum = ratings.reduce((total, rating) => total + rating, 0);
    return roundToDecimals(sum / ratings.length, 1);
  }

  private buildCategoryDistribution(categoryCounts: CategoryDrawCount[]) {
    const categoryCountMap = new Map(
      categoryCounts.map((item) => [item.category, item.count]),
    );

    return missionCategoryEnum.enumValues.map((category) => ({
      category,
      count: categoryCountMap.get(category) ?? 0,
    }));
  }

  private buildEmotionTagFrequency(reviewRows: ReviewStatsRow[]) {
    const tagCountMap = new Map<EmotionTag, number>();
    for (const row of reviewRows) {
      for (const tag of row.emotionTags ?? []) {
        tagCountMap.set(tag, (tagCountMap.get(tag) ?? 0) + 1);
      }
    }

    return EMOTION_TAGS.map((tag) => ({
      tag,
      count: tagCountMap.get(tag) ?? 0,
    }));
  }
}
