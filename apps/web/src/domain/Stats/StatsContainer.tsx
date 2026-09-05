'use client';

import { Button } from '@/common/components/Button';
import { QueryBoundary } from '@/common/components/QueryBoundary';
import { AverageRatingStars } from '@/domain/Stats/components/AverageRatingStars';
import { CategoryDistributionChart } from '@/domain/Stats/components/CategoryDistributionChart';
import { EmotionTagCloud } from '@/domain/Stats/components/EmotionTagCloud';
import { StatsSkeleton } from '@/domain/Stats/components/StatsSkeleton';
import { StatsSummaryRow } from '@/domain/Stats/components/StatsSummaryRow';
import { useStatsPage } from '@/domain/Stats/hooks/useStatsPage';

function StatsBody() {
  const { me, stats } = useStatsPage();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="relative flex flex-1 flex-col gap-5 rounded-md border-2 border-ink-primary bg-white px-6 py-10 filter-[url(#hand-rough)]">
        <p className="text-center text-lg font-bold text-ink-primary">
          {me.nickname}님의 새틈 통계
        </p>

        <div className="border-t border-dashed border-ink-tertiary/50" />

        {stats.totalDraws === 0 ? (
          <p className="text-ink-secondary">
            아직 쌓인 기록이 없어요.
            <br />
            오늘의 미션을 시작해보세요.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            <StatsSummaryRow
              totalDraws={stats.totalDraws}
              totalReviews={stats.totalReviews}
              reviewRate={stats.reviewRate}
            />
            <AverageRatingStars averageRating={stats.averageRating} />
            <CategoryDistributionChart items={stats.categoryDistribution} />
            <EmotionTagCloud items={stats.emotionTagFrequency} />
          </div>
        )}
      </div>

      <div className="my-4 flex justify-center">
        <Button
          href="/"
          variant="highlight"
          highlightWidth="w-14"
          highlightHeight="h-[85%]"
        >
          나가기
        </Button>
      </div>
    </div>
  );
}

export default function StatsContainer() {
  return (
    <div className="mx-auto flex w-[85%] flex-1 flex-col py-6">
      <QueryBoundary pendingFallback={<StatsSkeleton />}>
        <StatsBody />
      </QueryBoundary>
    </div>
  );
}
