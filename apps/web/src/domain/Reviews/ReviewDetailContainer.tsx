'use client';

import { QueryBoundary } from '@/common/components/QueryBoundary';
import { ReviewDetail } from './components/ReviewDetail';
import { ReviewSkeleton } from './components/ReviewSkeleton';
import { useReview } from './hooks/useReview';
import { useDeleteReview } from './hooks/useDeleteReview';

interface ReviewDetailBodyProps {
  missionDrawId: string;
}

function ReviewDetailBody({ missionDrawId }: ReviewDetailBodyProps) {
  const { data } = useReview(missionDrawId);
  const { mutate: deleteReview, isPending } = useDeleteReview();

  return (
    <ReviewDetail
      review={data}
      onDelete={() =>
        deleteReview({ reviewId: data.reviewId, missionDrawId })
      }
      isDeleting={isPending}
    />
  );
}

interface ReviewDetailContainerProps {
  missionDrawId: string;
}

export default function ReviewDetailContainer({
  missionDrawId,
}: ReviewDetailContainerProps) {
  return (
    <div className="mx-auto flex w-[85%] flex-1 flex-col py-6">
      <QueryBoundary pendingFallback={<ReviewSkeleton />}>
        <ReviewDetailBody missionDrawId={missionDrawId} />
      </QueryBoundary>
    </div>
  );
}
