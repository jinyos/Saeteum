import type { EmotionTagFrequencyItem } from '@/api/stats.api';
import { EMOTION_TAG_LABEL } from '@/common/constants';

interface EmotionTagCloudProps {
  items: EmotionTagFrequencyItem[];
}

type TagTier = 'none' | 'small' | 'medium' | 'large';

const TIER_CLASS: Record<TagTier, string> = {
  none: 'border-ink-tertiary bg-transparent text-ink-tertiary text-xs px-2 py-1',
  small:
    'border-point-yellow bg-point-yellow/10 text-ink-primary text-xs px-2 py-1',
  medium:
    'border-point-yellow bg-point-yellow/20 text-ink-primary text-sm px-3 py-1',
  large:
    'border-point-yellow bg-point-yellow/35 text-ink-primary text-base px-4 py-1.5',
};

function getTier(count: number, maxCount: number): TagTier {
  if (count === 0) {
    return 'none';
  }
  if (count >= maxCount * 0.66) {
    return 'large';
  }
  if (count >= maxCount * 0.33) {
    return 'medium';
  }
  return 'small';
}

export function EmotionTagCloud({ items }: EmotionTagCloudProps) {
  const maxCount = Math.max(1, ...items.map(({ count }) => count));

  return (
    <div className="flex flex-col gap-2">
      <span className="font-body text-sm text-ink-secondary">
        &lt;감정 태그&gt;
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {items.map(({ tag, count }) => (
          <span
            key={tag}
            className={`rounded-full border-2 ${TIER_CLASS[getTier(count, maxCount)]}`}
          >
            {EMOTION_TAG_LABEL[tag]}
          </span>
        ))}
      </div>
    </div>
  );
}
