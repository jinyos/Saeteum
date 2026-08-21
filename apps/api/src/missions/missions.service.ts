import { Injectable, Logger } from '@nestjs/common';
import {
  CandidateMission,
  MissionDrawsRepository,
} from './repositories/mission-draws.repository';
import { ReviewsRepository } from '@/reviews/repositories/reviews.repository';
import { getKstDayKey } from '@/common/utils/kst-day';
import { AppException } from '@/common/exceptions/app.exception';
import postgres from 'postgres';
import { UNIQUE_VIOLATION } from '@/common/constants';

type MissionSummary = Pick<CandidateMission, 'content'>;

export type MissionStatus =
  | { drawn: false }
  | {
      drawn: true;
      missionDrawId: string;
      mission: MissionSummary;
      hasReview: boolean;
      drawnAt: Date;
    };

export type DrawResult = {
  missionDrawId: string;
  mission: MissionSummary;
  drawnAt: Date;
};

@Injectable()
export class MissionsService {
  private readonly logger = new Logger(MissionsService.name);

  constructor(
    private readonly missionDrawsRepository: MissionDrawsRepository,
    private readonly reviewsRepository: ReviewsRepository,
  ) {}

  async getTodayStatus(userId: string): Promise<MissionStatus> {
    const drawn = await this.missionDrawsRepository.findByUserAndDay(
      userId,
      getKstDayKey(),
    );

    if (!drawn) {
      return { drawn: false };
    }

    const hasReview = await this.reviewsRepository.hasReview(
      drawn.missionDrawId,
    );

    return {
      drawn: true,
      missionDrawId: drawn.missionDrawId,
      mission: { content: drawn.mission.content },
      hasReview,
      drawnAt: drawn.drawnAt,
    };
  }

  async draw(userId: string): Promise<DrawResult> {
    const drawnDate = getKstDayKey();
    const alreadyDrawn = await this.missionDrawsRepository.findByUserAndDay(
      userId,
      drawnDate,
    );

    if (alreadyDrawn) {
      throw new AppException(
        'ALREADY_DRAWN_TODAY',
        'Mission already drawn today.',
      );
    }

    const candidate =
      await this.missionDrawsRepository.getCandidateMission(userId);

    if (!candidate) {
      this.logger.error(`No candidate mission available for user ${userId}`);

      throw new AppException('INTERNAL_ERROR', 'Internal server error.');
    }

    try {
      const created = await this.missionDrawsRepository.create({
        userId,
        missionId: candidate.id,
        drawnDate,
      });

      return {
        missionDrawId: created.id,
        mission: { content: candidate.content },
        drawnAt: created.drawnAt,
      };
    } catch (error) {
      if (
        error instanceof postgres.PostgresError &&
        error.code === UNIQUE_VIOLATION
      ) {
        throw new AppException(
          'ALREADY_DRAWN_TODAY',
          'Mission already drawn today.',
        );
      }

      throw error;
    }
  }
}
