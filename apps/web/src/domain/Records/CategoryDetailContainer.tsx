'use client';

import type { MissionCategory } from '@saeteum/shared';
import { Button } from '@/common/components/Button';
import { IndexMark } from '@/common/components/IndexMark';
import { QueryBoundary } from '@/common/components/QueryBoundary';
import { CATEGORY_BG_CLASS, CATEGORY_LABEL } from '@/common/constants';
import { CategoryMissionGrid } from './components/CategoryMissionGrid';
import { CategoryDetailSkeleton } from './components/CategoryDetailSkeleton';
import { useCategoryMissions } from './hooks/useCategoryMissions';

interface CategoryDetailBodyProps {
  category: MissionCategory;
}

function CategoryDetailBody({ category }: CategoryDetailBodyProps) {
  const { data } = useCategoryMissions(category);

  return (
    <>
      <IndexMark
        label={CATEGORY_LABEL[category]}
        active
        activeColor={CATEGORY_BG_CLASS[category]}
        size="lg"
        className="mb-4"
      />

      <CategoryMissionGrid category={category} missions={data} />

      <div className="mt-10 flex justify-center">
        <Button
          href="/mypage/records"
          variant="highlight"
          highlightWidth="w-14"
          highlightHeight="h-[85%]"
        >
          돌아가기
        </Button>
      </div>
    </>
  );
}

interface CategoryDetailContainerProps {
  category: MissionCategory;
}

export default function CategoryDetailContainer({
  category,
}: CategoryDetailContainerProps) {
  return (
    <div className="mx-auto w-[85%] py-6">
      <QueryBoundary pendingFallback={<CategoryDetailSkeleton />}>
        <CategoryDetailBody category={category} />
      </QueryBoundary>
    </div>
  );
}
