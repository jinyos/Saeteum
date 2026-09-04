'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import type { Review } from '@/api/reviews.api';
import { Button } from '@/common/components/Button';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { EMOTION_TAG_LABEL, RATING_VALUES } from '@/common/constants';
import { Man } from '@/common/doodles/Man';
import { Woman } from '@/common/doodles/Woman';

interface ReviewDetailProps {
  review: Review;
  onDelete: () => void;
  isDeleting: boolean;
}

export function ReviewDetail({
  review,
  onDelete,
  isDeleting,
}: ReviewDetailProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function handleConfirmDelete() {
    setIsConfirmOpen(false);
    onDelete();
  }

  const rating = review.rating;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="relative flex flex-1 flex-col gap-5 rounded-md border-2 border-ink-primary bg-white px-6 py-10 filter-[url(#hand-rough)]">
        <div className="flex items-center justify-between">
          <p className="font-bold text-ink-primary">&lt;오늘의 새틈&gt;</p>
          {rating !== null && (
            <div className="flex gap-1" aria-label={`별점 ${rating}점`}>
              {RATING_VALUES.map((star) => (
                <Star
                  key={star}
                  size={20}
                  strokeWidth={1.5}
                  className="text-point-yellow"
                  fill={star <= rating ? 'currentColor' : 'none'}
                />
              ))}
            </div>
          )}
        </div>
        <p className="font-caption text-lg text-ink-primary">
          {review.mission.content}
        </p>

        <div className="border-t border-dashed border-ink-tertiary/50" />

        {review.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.photoUrl}
            alt="후기 사진"
            className="w-full rounded-md border-2 border-ink-primary object-cover"
          />
        )}

        {review.content && (
          <p className="font-caption text-lg text-ink-primary">
            {review.content}
          </p>
        )}

        {review.emotionTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {review.emotionTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border-2 border-point-yellow bg-point-yellow/30 px-3 py-1 text-sm text-ink-primary"
              >
                {EMOTION_TAG_LABEL[tag]}
              </span>
            ))}
          </div>
        )}

        <Man className="absolute right-10 bottom-4 size-20 rotate-18 text-ink-tertiary opacity-25" />
        <Woman className="absolute right-2 bottom-25 size-20 -rotate-18 text-ink-tertiary opacity-25" />
      </div>

      <div className="my-4 flex justify-center gap-12">
        <Button
          href="/"
          variant="highlight"
          highlightWidth="w-14"
          highlightHeight="h-[85%]"
        >
          나가기
        </Button>
        {review.editable && (
          <Button
            onClick={() => setIsConfirmOpen(true)}
            disabled={isDeleting}
            danger
            variant="highlight"
            highlightWidth="w-18"
            highlightHeight="h-[85%]"
          >
            삭제하기
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        message={'후기를 삭제할까요?\n삭제하면 되돌릴 수 없어요.'}
        confirmLabel="삭제"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
