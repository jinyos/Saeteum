export function StatsSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-1 flex-col gap-5 rounded-md border-2 border-ink-primary bg-white px-6 py-10 filter-[url(#hand-rough)]">
        <div className="h-6 w-2/3 animate-pulse rounded bg-ink-tertiary/20" />

        <div className="border-t border-dashed border-ink-tertiary/50" />

        <div className="flex animate-pulse gap-3">
          <div className="h-20 flex-1 rounded-md bg-ink-tertiary/20" />
          <div className="h-20 flex-1 rounded-md bg-ink-tertiary/20" />
          <div className="h-20 flex-1 rounded-md bg-ink-tertiary/20" />
        </div>
        <div className="h-8 w-1/2 animate-pulse rounded bg-ink-tertiary/20" />
        <div className="h-40 animate-pulse rounded-md bg-ink-tertiary/20" />
        <div className="h-16 animate-pulse rounded-md bg-ink-tertiary/20" />
      </div>

      <div className="my-4 flex animate-pulse justify-center">
        <div className="h-6 w-14 rounded bg-ink-tertiary/20" />
      </div>
    </div>
  );
}
