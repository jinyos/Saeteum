import { db } from '@/db';
import { missionCategoryEnum, missionDraws, missions, reviews } from '@/db/schema';
import { Injectable } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';
import { EmotionTag } from '@saeteum/shared';

export type MissionCategory = (typeof missionCategoryEnum.enumValues)[number];

export type CategoryDrawCount = { category: MissionCategory; count: number };

export type ReviewStatsRow = {
  rating: number | null;
  emotionTags: EmotionTag[] | null;
};

@Injectable()
export class StatsRepository {
  async countDraws(userId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(missionDraws)
      .where(eq(missionDraws.userId, userId));

    return row?.value ?? 0;
  }

  async getDrawCountsByCategory(userId: string): Promise<CategoryDrawCount[]> {
    return db
      .select({ category: missions.category, count: count() })
      .from(missionDraws)
      .innerJoin(missions, eq(missions.id, missionDraws.missionId))
      .where(eq(missionDraws.userId, userId))
      .groupBy(missions.category);
  }

  async getReviewStatsRows(userId: string): Promise<ReviewStatsRow[]> {
    return db
      .select({ rating: reviews.rating, emotionTags: reviews.emotionTags })
      .from(reviews)
      .innerJoin(missionDraws, eq(missionDraws.id, reviews.missionDrawId))
      .where(eq(missionDraws.userId, userId));
  }
}
