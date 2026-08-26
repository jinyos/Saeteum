import { POSTIT_CLASS } from './Mission';

export function MissionSkeleton() {
  return (
    <>
      <div className="relative mx-auto aspect-square w-4/5 -rotate-2">
        <div className={POSTIT_CLASS}>
          <div className="flex animate-pulse flex-col items-center gap-3">
            <div className="h-6 w-32 rounded bg-ink-tertiary/20" />
            <div className="h-6 w-44 rounded bg-ink-tertiary/20" />
          </div>
        </div>
        <div className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-2 bg-point-red/20" />
      </div>
      <div className="flex gap-4">
        <div className="h-11 w-32 animate-pulse rounded-md border-2 border-ink-primary/30 bg-ink-tertiary/10 filter-[url(#hand-rough)]" />
        <div className="h-11 w-32 animate-pulse rounded-md border-2 border-ink-primary/30 bg-ink-tertiary/10 filter-[url(#hand-rough)]" />
      </div>
    </>
  );
}
