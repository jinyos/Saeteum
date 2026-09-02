import { MISSION_CATEGORIES, type MissionCategory } from '@saeteum/shared';

export const CATEGORY_LABEL: Record<MissionCategory, string> = {
  nature: '자연',
  exploration: '탐험',
  connection: '사람과의 연결',
  solitude: '혼자만의 시간',
  movement: '몸 움직이기',
  creation: '창작·기록',
  sensation: '새로운 감각',
  declutter: '정리·비움',
};

export function isMissionCategory(value: string): value is MissionCategory {
  return (MISSION_CATEGORIES as readonly string[]).includes(value);
}

export const CATEGORY_BG_CLASS: Record<MissionCategory, string> = {
  nature: 'bg-category-nature',
  exploration: 'bg-category-exploration',
  connection: 'bg-category-connection',
  solitude: 'bg-category-solitude',
  movement: 'bg-category-movement',
  creation: 'bg-category-creation',
  sensation: 'bg-category-sensation',
  declutter: 'bg-category-declutter',
};
