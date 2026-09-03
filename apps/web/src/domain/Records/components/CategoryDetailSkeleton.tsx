const PLACEHOLDER_COUNT = 20;

export function CategoryDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-12 animate-pulse rounded-md border-2 border-ink-tertiary/30 bg-ink-tertiary/10" />
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
          <div
            key={index}
            className="aspect-square animate-pulse rounded-md border-2 border-ink-tertiary/30 bg-ink-tertiary/10"
          />
        ))}
      </div>
    </div>
  );
}
