'use client';

import { Star } from 'lucide-react';
import { RATING_VALUES } from '@/common/constants';

interface RatingInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export function RatingInput({ value, onChange }: RatingInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-body text-sm text-ink-secondary">별점</span>
      <div className="flex gap-1" role="group" aria-label="별점">
        {RATING_VALUES.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star === value ? undefined : star)}
            aria-label={`별점 ${star}점`}
            aria-pressed={value !== undefined && star <= value}
            className="cursor-pointer text-point-yellow transition-transform active:scale-90"
          >
            <Star
              size={28}
              strokeWidth={1.5}
              fill={value !== undefined && star <= value ? 'currentColor' : 'none'}
              className="filter-[url(#hand-rough)]"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
