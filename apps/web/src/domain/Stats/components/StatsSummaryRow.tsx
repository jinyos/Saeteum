interface StatsSummaryRowProps {
  totalDraws: number;
  totalReviews: number;
  reviewRate: number;
}

const SUMMARY_ITEM_CLASS =
  'flex flex-1 flex-col items-center gap-1 rounded-md border-2 border-ink-primary bg-base-paper py-4';

interface SummaryItemProps {
  value: string | number;
  label: string;
}

function SummaryItem({ value, label }: SummaryItemProps) {
  return (
    <div className={SUMMARY_ITEM_CLASS}>
      <span className="font-caption text-2xl text-ink-primary">{value}</span>
      <span className="text-xs text-ink-secondary">{label}</span>
    </div>
  );
}

export function StatsSummaryRow({
  totalDraws,
  totalReviews,
  reviewRate,
}: StatsSummaryRowProps) {
  return (
    <div className="flex gap-3">
      <SummaryItem value={totalDraws} label="총 뽑기" />
      <SummaryItem value={totalReviews} label="총 후기" />
      <SummaryItem
        value={`${Math.round(reviewRate * 100)}%`}
        label="후기 작성률"
      />
    </div>
  );
}
