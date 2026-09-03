import { Star } from 'lucide-react';
import { EMOTION_TAG_LABEL, RATING_VALUES } from '@/common/constants';
import { formatDate } from '@/common/utils/formatDate';
import type { MissionDraw } from '@/api/records.api';

interface MissionRecordEntryProps {
  draw: MissionDraw;
}

export function MissionRecordEntry({ draw }: MissionRecordEntryProps) {
  const { review } = draw;
  const rating = review?.rating;

  return (
    <div className="flex flex-col gap-4 rounded-md border-2 border-ink-primary bg-white px-6 py-6 filter-[url(#hand-rough)]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-secondary">{formatDate(draw.drawnAt)}</p>
        {rating !== null && rating !== undefined && (
          <div className="flex gap-1" aria-label={`별점 ${rating}점`}>
            {RATING_VALUES.map((star) => (
              <Star
                key={star}
                size={16}
                strokeWidth={1.5}
                className="text-point-yellow"
                fill={star <= rating ? 'currentColor' : 'none'}
              />
            ))}
          </div>
        )}
      </div>

      {!review && (
        <p className="font-caption text-ink-tertiary">후기를 남기지 않았어요</p>
      )}

      {review?.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={review.photoUrl}
          alt="후기 사진"
          className="w-full rounded-md border-2 border-ink-primary object-cover"
        />
      )}

      {review?.content && (
        <p className="font-caption text-ink-primary">{review.content}</p>
      )}

      {review && review.emotionTags.length > 0 && (
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
    </div>
  );
}
