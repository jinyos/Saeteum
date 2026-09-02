'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QueryBoundary } from '@/common/components/QueryBoundary';
import { Spinner } from '@/common/components/Spinner';
import { useTodayMission } from '@/domain/Missions/hooks/useTodayMission';
import { ReviewForm, type ReviewFormValues } from './components/ReviewForm';
import { useCreateReview } from './hooks/useCreateReview';

function ReviewFormBody() {
  const router = useRouter();
  const { data } = useTodayMission();
  const { mutate, isPending } = useCreateReview();

  const canWriteReview = data.drawn && !data.hasReview;

  useEffect(() => {
    if (!canWriteReview) {
      router.replace('/');
    }
  }, [canWriteReview, router]);

  if (!data.drawn || !canWriteReview) {
    return null;
  }

  const missionDrawId = data.missionDrawId;

  function handleSubmit(values: ReviewFormValues) {
    mutate({ missionDrawId, ...values });
  }

  return (
    <ReviewForm
      missionContent={data.mission.content}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  );
}

export default function ReviewFormContainer() {
  return (
    <div className="mx-auto w-[85%] py-6">
      <QueryBoundary pendingFallback={<Spinner className="mx-auto h-8 w-8" />}>
        <ReviewFormBody />
      </QueryBoundary>
    </div>
  );
}
