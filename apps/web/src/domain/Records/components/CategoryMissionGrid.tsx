import Link from 'next/link';
import {
  CircleQuestionMark,
  FaceSlightlySmiling,
  Footprints,
  Gift,
  HeartHandshake,
  Pencil,
  SignpostBig,
  Sprout,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import type { MissionCategory } from '@saeteum/shared';
import type { MissionDrawStatus } from '@/api/records.api';

const CATEGORY_ICON: Record<MissionCategory, LucideIcon> = {
  nature: Sprout,
  exploration: SignpostBig,
  connection: HeartHandshake,
  solitude: FaceSlightlySmiling,
  movement: Footprints,
  creation: Pencil,
  sensation: Gift,
  declutter: Trash2,
};

const DRAWN_BOX_CLASS: Record<MissionCategory, string> = {
  nature: 'bg-category-nature/15 text-category-nature',
  exploration: 'bg-category-exploration/15 text-category-exploration',
  connection: 'bg-category-connection/15 text-category-connection',
  solitude: 'bg-category-solitude/15 text-category-solitude',
  movement: 'bg-category-movement/15 text-category-movement',
  creation: 'bg-category-creation/15 text-category-creation',
  sensation: 'bg-category-sensation/15 text-category-sensation',
  declutter: 'bg-category-declutter/15 text-category-declutter',
};

interface CategoryMissionGridProps {
  category: MissionCategory;
  missions: MissionDrawStatus[];
}

export function CategoryMissionGrid({
  category,
  missions,
}: CategoryMissionGridProps) {
  const Icon = CATEGORY_ICON[category];

  return (
    <div className="grid grid-cols-5 gap-3">
      {missions.map(({ missionId, drawn }) => {
        const box = (
          <span
            className={`flex aspect-square items-center justify-center rounded-md border-2 border-ink-primary filter-[url(#hand-rough)] ${
              drawn ? DRAWN_BOX_CLASS[category] : 'bg-ink-tertiary/20 text-ink-tertiary'
            }`}
          >
            {drawn ? (
              <Icon size={24} strokeWidth={1.5} />
            ) : (
              <CircleQuestionMark size={24} strokeWidth={1.5} />
            )}
          </span>
        );

        if (!drawn) {
          return (
            <div key={missionId} aria-label="아직 뽑지 않은 미션">
              {box}
            </div>
          );
        }

        return (
          <Link
            key={missionId}
            href={`/mypage/records/${category}/${missionId}`}
            className="transition-transform active:scale-[0.95]"
          >
            {box}
          </Link>
        );
      })}
    </div>
  );
}
