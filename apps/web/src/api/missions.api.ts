import { authorizedFetch } from '@/lib/auth/authorizedFetch';

export interface MissionSummary {
  content: string;
}

export type TodayMission =
  | { drawn: false }
  | {
      drawn: true;
      missionDrawId: string;
      mission: MissionSummary;
      hasReview: boolean;
      drawnAt: string;
    };

export interface DrawMissionResult {
  missionDrawId: string;
  mission: MissionSummary;
  drawnAt: string;
}

export function getTodayMission(): Promise<TodayMission> {
  return authorizedFetch<TodayMission>('/missions/today');
}

export function drawMission(): Promise<DrawMissionResult> {
  return authorizedFetch<DrawMissionResult>('/missions/draw', {
    method: 'POST',
  });
}
