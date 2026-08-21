import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { missionCategoryEnum } from '@/db/schema';
import { StorageService } from '@/storage/storage.service';
import { EmotionTag } from '@saeteum/shared';
import {
  MissionCategory,
  MissionDraw,
  MissionDrawnStatus,
  MissionDrawReview,
  MissionInfo,
  RecordsRepository,
} from './repositories/records.repository';

export type MissionDrawReviewSummary = {
  id: string;
  rating: number | null;
  photoUrl: string | null;
  content: string | null;
  emotionTags: EmotionTag[] | null;
  createdAt: Date;
};

export type MissionDrawSummary = {
  missionDrawId: string;
  drawnAt: Date;
  review: MissionDrawReviewSummary | null;
};

export type MissionRecordDetail = {
  mission: MissionInfo;
  draws: MissionDrawSummary[];
};

function isMissionCategory(value: string): value is MissionCategory {
  return (missionCategoryEnum.enumValues as readonly string[]).includes(value);
}

@Injectable()
export class RecordsService {
  constructor(
    private readonly recordsRepository: RecordsRepository,
    private readonly storageService: StorageService,
  ) {}

  async getCategoryDetail(
    userId: string,
    category: string,
  ): Promise<MissionDrawnStatus[]> {
    if (!isMissionCategory(category)) {
      throw new AppException('RESOURCE_NOT_FOUND', 'Category not found.');
    }

    return this.recordsRepository.findMissionStatusByCategory(userId, category);
  }

  async getMissionDetail(
    userId: string,
    missionId: number,
  ): Promise<MissionRecordDetail> {
    const mission = await this.recordsRepository.findMissionById(missionId);

    if (!mission) {
      throw new AppException('RESOURCE_NOT_FOUND', 'Mission not found.');
    }

    const draws = await this.recordsRepository.findUserDrawsByMission(
      userId,
      missionId,
    );

    if (draws.length === 0) {
      throw new AppException('RESOURCE_NOT_FOUND', 'Mission not found.');
    }

    const summaries = await Promise.all(
      draws.map((draw) => this.toDrawSummary(draw)),
    );

    return { mission, draws: summaries };
  }

  private async toDrawSummary(draw: MissionDraw): Promise<MissionDrawSummary> {
    return {
      missionDrawId: draw.missionDrawId,
      drawnAt: draw.drawnAt,
      review: draw.review ? await this.toReviewSummary(draw.review) : null,
    };
  }

  private async toReviewSummary(
    review: MissionDrawReview,
  ): Promise<MissionDrawReviewSummary> {
    return {
      id: review.id,
      rating: review.rating,
      photoUrl: review.photoPath
        ? await this.storageService.createReadUrl(review.photoPath)
        : null,
      content: review.content,
      emotionTags: review.emotionTags,
      createdAt: review.createdAt,
    };
  }
}
