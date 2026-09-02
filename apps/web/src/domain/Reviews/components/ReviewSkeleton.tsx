export function ReviewSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-1 flex-col gap-5 rounded-md border-2 border-ink-primary bg-white px-6 py-10 filter-[url(#hand-rough)]">
        <div className="flex animate-pulse items-center justify-between">
          <div className="h-5 w-24 rounded bg-ink-tertiary/20" />
          <div className="h-5 w-28 rounded bg-ink-tertiary/20" />
        </div>
        <div className="h-6 w-2/3 animate-pulse rounded bg-ink-tertiary/20" />

        <div className="border-t border-dashed border-ink-tertiary/50" />

        <div className="h-40 w-full animate-pulse rounded-md bg-ink-tertiary/20" />

        <div className="flex animate-pulse flex-col gap-2">
          <div className="h-5 w-full rounded bg-ink-tertiary/20" />
          <div className="h-5 w-4/5 rounded bg-ink-tertiary/20" />
        </div>

        <div className="flex animate-pulse gap-2">
          <div className="h-8 w-16 rounded-full bg-ink-tertiary/20" />
          <div className="h-8 w-16 rounded-full bg-ink-tertiary/20" />
        </div>
      </div>

      <div className="mt-4 flex animate-pulse justify-center gap-12">
        <div className="h-6 w-14 rounded bg-ink-tertiary/20" />
        <div className="h-6 w-18 rounded bg-ink-tertiary/20" />
      </div>
    </div>
  );
}
