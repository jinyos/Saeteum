import type { EmotionTag, MissionCategory } from '@saeteum/shared';
import { authorizedFetch } from '@/lib/auth/authorizedFetch';

export interface MissionDrawStatus {
  missionId: number;
  drawn: boolean;
}

export interface MissionDraw {
  missionDrawId: string;
  drawnAt: string;
  review: {
    rating: number | null;
    photoUrl: string | null;
    content: string | null;
    emotionTags: EmotionTag[];
  } | null;
}

export interface MissionRecord {
  mission: { id: number; category: MissionCategory; content: string };
  draws: MissionDraw[];
}

export function getCategoryMissions(
  category: MissionCategory,
): Promise<MissionDrawStatus[]> {
  return authorizedFetch<MissionDrawStatus[]>(
    `/records/categories/${category}`,
  );
}

export function getMissionRecord(missionId: number): Promise<MissionRecord> {
  return authorizedFetch<MissionRecord>(`/records/missions/${missionId}`);
}
