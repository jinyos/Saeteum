import { db } from '@/db';
import { missionDraws, missions, reviews } from '@/db/schema';
import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { EmotionTag } from '@saeteum/shared';

export type MissionDrawContext = {
  missionDrawId: string;
  drawnAt: Date;
  mission: { id: number; category: string; content: string };
};

const REVIEW_COLUMNS = {
  id: reviews.id,
  missionDrawId: reviews.missionDrawId,
  rating: reviews.rating,
  photoPath: reviews.photoPath,
  content: reviews.content,
  emotionTags: reviews.emotionTags,
  createdAt: reviews.createdAt,
};

export type Review = {
  id: string;
  missionDrawId: string;
  rating: number | null;
  photoPath: string | null;
  content: string | null;
  emotionTags: EmotionTag[] | null;
  createdAt: Date;
};

@Injectable()
export class ReviewsRepository {
  async findMissionDrawForReview(
    missionDrawId: string,
    userId: string,
  ): Promise<MissionDrawContext | null> {
    const [row] = await db
      .select({
        missionDrawId: missionDraws.id,
        drawnAt: missionDraws.drawnAt,
        mission: {
          id: missions.id,
          category: missions.category,
          content: missions.content,
        },
      })
      .from(missionDraws)
      .innerJoin(missions, eq(missionDraws.missionId, missions.id))
      .where(
        and(
          eq(missionDraws.id, missionDrawId),
          eq(missionDraws.userId, userId),
        ),
      )
      .limit(1);

    return row ?? null;
  }

  async findByMissionDrawId(missionDrawId: string): Promise<Review | null> {
    const [row] = await db
      .select(REVIEW_COLUMNS)
      .from(reviews)
      .where(eq(reviews.missionDrawId, missionDrawId))
      .limit(1);

    return row ?? null;
  }

  async create(input: {
    missionDrawId: string;
    rating?: number;
    photoPath?: string;
    content?: string;
    emotionTags?: EmotionTag[];
  }): Promise<Review> {
    const [row] = await db
      .insert(reviews)
      .values({
        missionDrawId: input.missionDrawId,
        rating: input.rating,
        photoPath: input.photoPath,
        content: input.content,
        emotionTags: input.emotionTags,
      })
      .returning(REVIEW_COLUMNS);

    return row;
  }

  async hasReview(missionDrawId: string): Promise<boolean> {
    const [row] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(eq(reviews.missionDrawId, missionDrawId))
      .limit(1);

    return row !== undefined;
  }

  async findReviewWithMissionDraw(
    reviewId: string,
    userId: string,
  ): Promise<{ drawnAt: Date; photoPath: string | null } | null> {
    const [row] = await db
      .select({ drawnAt: missionDraws.drawnAt, photoPath: reviews.photoPath })
      .from(reviews)
      .innerJoin(missionDraws, eq(reviews.missionDrawId, missionDraws.id))
      .where(and(eq(reviews.id, reviewId), eq(missionDraws.userId, userId)))
      .limit(1);

    return row ?? null;
  }

  async remove(reviewId: string): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, reviewId));
  }
}
