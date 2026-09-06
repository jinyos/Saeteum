import { Star } from 'lucide-react';
import { RATING_VALUES } from '@/common/constants';

interface AverageRatingStarsProps {
  averageRating: number | null;
}

function getFillRatio(averageRating: number | null, star: number): number {
  return Math.min(1, Math.max(0, (averageRating ?? 0) - (star - 1)));
}

function RatingStar({ fillRatio }: { fillRatio: number }) {
  return (
    <span className="relative text-ink-tertiary">
      <Star size={24} strokeWidth={1.5} />
      <span
        className="absolute inset-0 overflow-hidden text-point-yellow"
        style={{ width: `${fillRatio * 100}%` }}
      >
        <Star size={24} strokeWidth={1.5} fill="currentColor" />
      </span>
    </span>
  );
}

export function AverageRatingStars({ averageRating }: AverageRatingStarsProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-body text-sm text-ink-secondary">
        &lt;별점 평균&gt;
      </span>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {RATING_VALUES.map((star) => (
            <RatingStar
              key={star}
              fillRatio={getFillRatio(averageRating, star)}
            />
          ))}
        </div>
        <span className="text-sm text-ink-secondary">
          {averageRating !== null ? averageRating.toFixed(1) : '-'}
        </span>
      </div>
    </div>
  );
}
