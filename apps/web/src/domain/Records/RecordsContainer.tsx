import type { MissionCategory } from '@saeteum/shared';
import { IndexMark } from '@/common/components/IndexMark';
import { CATEGORY_BG_CLASS, CATEGORY_LABEL } from '@/common/constants';

const CATEGORY_ROTATE_CLASS: Record<MissionCategory, string> = {
  nature: 'rotate-[0.5deg]',
  exploration: '-rotate-2 -translate-x-1',
  connection: 'rotate-[0.5deg] translate-x-1',
  solitude: '-rotate-1',
  movement: '-rotate-2 translate-x-1',
  creation: 'rotate-1 -translate-x-1',
  sensation: '-rotate-[1.5deg]',
  declutter: '-rotate-[0.5deg]',
};

const CATEGORIES = Object.keys(CATEGORY_LABEL) as MissionCategory[];

export default function RecordsContainer() {
  return (
    <div className="mx-auto flex w-[85%] flex-col gap-3 py-6">
      {CATEGORIES.map((category) => (
        <IndexMark
          key={category}
          href={`/mypage/records/${category}`}
          label={CATEGORY_LABEL[category]}
          active
          activeColor={CATEGORY_BG_CLASS[category]}
          size="lg"
          className={CATEGORY_ROTATE_CLASS[category]}
        />
      ))}
    </div>
  );
}
