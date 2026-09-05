import type { CategoryDistributionItem } from '@/api/stats.api';
import { CATEGORY_BG_CLASS, CATEGORY_LABEL } from '@/common/constants';

interface CategoryDistributionChartProps {
  items: CategoryDistributionItem[];
}

export function CategoryDistributionChart({
  items,
}: CategoryDistributionChartProps) {
  const maxCount = Math.max(1, ...items.map(({ count }) => count));

  return (
    <div className="flex flex-col gap-2">
      <span className="font-body text-sm text-ink-secondary">
        &lt;카테고리 경험&gt;
      </span>
      <div className="flex flex-col gap-1.5">
        {items.map(({ category, count }) => (
          <div key={category} className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-sm whitespace-nowrap text-ink-primary">
              {CATEGORY_LABEL[category]}
            </span>
            <div className="h-4 flex-1 rounded-sm bg-ink-tertiary/15">
              <div
                className={`h-full rounded-sm filter-[url(#hand-rough)] ${CATEGORY_BG_CLASS[category]}`}
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-4 shrink-0 text-right text-sm text-ink-secondary">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
