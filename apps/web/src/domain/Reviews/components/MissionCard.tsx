interface MissionCardProps {
  content: string;
}

export function MissionCard({ content }: MissionCardProps) {
  return (
    <div className="relative">
      <div className="flex flex-col gap-3 rounded-md border-2 border-ink-primary bg-white p-6 pb-10 text-center filter-[url(#hand-rough)]">
        <p className="text-left font-body text-sm text-ink-tertiary">
          오늘의 새틈
        </p>
        <p className="mt-2 font-caption text-lg text-ink-primary">
          {content}
        </p>
      </div>
      <div className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-2 bg-point-red/20" />
    </div>
  );
}
