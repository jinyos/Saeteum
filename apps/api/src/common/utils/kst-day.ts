import { MS_PER_HOUR } from '@saeteum/shared';

const KST_OFFSET_MS = 9 * MS_PER_HOUR;

export function getKstDayKey(date: Date = new Date()): string {
  const kstShifted = new Date(date.getTime() + KST_OFFSET_MS);

  return kstShifted.toISOString().slice(0, 10);
}
