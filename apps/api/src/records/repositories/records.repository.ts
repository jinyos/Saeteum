import { db } from '@/db';
import { missionCategoryEnum, missionDraws, missions, reviews } from '@/db/schema';
import { Injectable } from '@nestjs/common';
import { and, asc, desc, eq, exists, sql } from 'drizzle-orm';
import { EmotionTag } from '@saeteum/shared';

export type MissionCategory = (typeof missionCategoryEnum.enumValues)[number];

export type MissionDrawnStatus = { missionId: number; drawn: boolean };

export type MissionInfo = {
  id: number;
  category: MissionCategory;
  content: string;
};

export type MissionDrawReview = {
  id: string;
  rating: number | null;
  photoPath: string | null;
  content: string | null;
  emotionTags: EmotionTag[] | null;
  createdAt: Date;
};

export type MissionDraw = {
  missionDrawId: string;
  drawnAt: Date;
  review: MissionDrawReview | null;
};

@Injectable()
export class RecordsRepository {
  async findMissionStatusByCategory(
    userId: string,
    category: MissionCategory,
  ): Promise<MissionDrawnStatus[]> {
    return db
      .select({
        missionId: missions.id,
        drawn: sql<boolean>`${exists(
          db
            .select({ id: missionDraws.id })
            .from(missionDraws)
            .where(
              and(
                eq(missionDraws.missionId, missions.id),
                eq(missionDraws.userId, userId),
              ),
            ),
        )}`,
      })
      .from(missions)
      .where(eq(missions.category, category))
      .orderBy(asc(missions.id));
  }

  async findMissionById(missionId: number): Promise<MissionInfo | null> {
    const [row] = await db
      .select({
        id: missions.id,
        category: missions.category,
        content: missions.content,
      })
      .from(missions)
      .where(eq(missions.id, missionId))
      .limit(1);

    return row ?? null;
  }

  async findUserDrawsByMission(
    userId: string,
    missionId: number,
  ): Promise<MissionDraw[]> {
    const rows = await db
      .select({
        missionDrawId: missionDraws.id,
        drawnAt: missionDraws.drawnAt,
        reviewId: reviews.id,
        rating: reviews.rating,
        photoPath: reviews.photoPath,
        content: reviews.content,
        emotionTags: reviews.emotionTags,
        reviewCreatedAt: reviews.createdAt,
      })
      .from(missionDraws)
      .leftJoin(reviews, eq(reviews.missionDrawId, missionDraws.id))
      .where(
        and(
          eq(missionDraws.userId, userId),
          eq(missionDraws.missionId, missionId),
        ),
      )
      .orderBy(desc(missionDraws.drawnAt));

    return rows.map((row) => ({
      missionDrawId: row.missionDrawId,
      drawnAt: row.drawnAt,
      review: row.reviewId
        ? {
            id: row.reviewId,
            rating: row.rating,
            photoPath: row.photoPath,
            content: row.content,
            emotionTags: row.emotionTags,
            createdAt: row.reviewCreatedAt!,
          }
        : null,
    }));
  }
}
