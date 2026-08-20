import { EmotionTag, MAX_REVIEW_TAGS } from '@saeteum/shared';
import { Injectable } from '@nestjs/common';
import { ReviewsRepository } from './repositories/reviews.repository';
import { AppException } from '@/common/exceptions/app.exception';
import { getKstDayKey } from '@/common/utils/kst-day';
import { UNIQUE_VIOLATION } from '@/common/constants';
import postgres from 'postgres';

export type CreateReviewInput = {
  missionDrawId: string;
  rating?: number;
  photoPath?: string;
  content?: string;
  emotionTags?: EmotionTag[];
};

export type ReviewDetail = {
  reviewId: string;
  mission: { content: string };
  rating: number | null;
  photoPath: string | null;
  content: string | null;
  emotionTags: EmotionTag[] | null;
  editable: boolean;
};

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  async create(
    userId: string,
    input: CreateReviewInput,
  ): Promise<{ reviewId: string }> {
    const hasAnyInput =
      input.rating !== undefined ||
      !!input.photoPath ||
      !!input.content?.trim() ||
      (input.emotionTags?.length ?? 0) > 0;

    if (!hasAnyInput) {
      throw new AppException(
        'REVIEW_EMPTY_INPUT',
        'At least one field is required.',
      );
    }

    if ((input.emotionTags?.length ?? 0) > MAX_REVIEW_TAGS) {
      throw new AppException(
        'REVIEW_TOO_MANY_TAGS',
        'Up to 3 tags are allowed.',
      );
    }

    const context = await this.reviewsRepository.findMissionDrawForReview(
      input.missionDrawId,
      userId,
    );

    if (!context) {
      throw new AppException('RESOURCE_NOT_FOUND', 'Mission draw not found.');
    }

    if (getKstDayKey(context.drawnAt) !== getKstDayKey()) {
      throw new AppException(
        'REVIEW_CLOSED',
        'Review is closed for this mission.',
      );
    }

    const existing = await this.reviewsRepository.findByMissionDrawId(
      input.missionDrawId,
    );

    if (existing) {
      throw new AppException('REVIEW_ALREADY_EXISTS', 'Review already exists.');
    }

    try {
      const created = await this.reviewsRepository.create({
        missionDrawId: input.missionDrawId,
        rating: input.rating,
        photoPath: input.photoPath,
        content: input.content,
        emotionTags: input.emotionTags,
      });

      return { reviewId: created.id };
    } catch (error) {
      if (
        error instanceof postgres.PostgresError &&
        error.code === UNIQUE_VIOLATION
      ) {
        throw new AppException(
          'REVIEW_ALREADY_EXISTS',
          'Review already exists.',
        );
      }

      throw error;
    }
  }

  async getDetail(
    userId: string,
    missionDrawId: string,
  ): Promise<ReviewDetail> {
    const context = await this.reviewsRepository.findMissionDrawForReview(
      missionDrawId,
      userId,
    );

    if (!context) {
      throw new AppException('RESOURCE_NOT_FOUND', 'Mission draw not found.');
    }

    const review =
      await this.reviewsRepository.findByMissionDrawId(missionDrawId);

    if (!review) {
      throw new AppException('RESOURCE_NOT_FOUND', 'Review not found.');
    }

    return {
      reviewId: review.id,
      mission: { content: context.mission.content },
      rating: review.rating,
      // Storage 연동 전이라 signed URL 변환 없이 저장된 경로를 그대로 내려준다.
      photoPath: review.photoPath,
      content: review.content,
      emotionTags: review.emotionTags,
      editable: getKstDayKey(context.drawnAt) === getKstDayKey(),
    };
  }

  async delete(userId: string, reviewId: string): Promise<void> {
    const target = await this.reviewsRepository.findReviewWithMissionDraw(
      reviewId,
      userId,
    );

    if (!target) {
      throw new AppException('RESOURCE_NOT_FOUND', 'Review not found.');
    }

    if (getKstDayKey(target.drawnAt) !== getKstDayKey()) {
      throw new AppException(
        'REVIEW_CLOSED',
        'Review is closed for this mission.',
      );
    }

    await this.reviewsRepository.remove(reviewId);
  }
}
