interface MissionCardProps {
  content: string;
  label?: string | null;
  padding?: string;
}

export function MissionCard({
  content,
  label = '오늘의 새틈',
  padding = 'p-6 pb-10',
}: MissionCardProps) {
  return (
    <div className="relative">
      <div
        className={`flex flex-col gap-3 rounded-md border-2 border-ink-primary bg-white text-center filter-[url(#hand-rough)] ${padding}`}
      >
        {label && (
          <p className="text-left font-body text-sm text-ink-tertiary">
            {label}
          </p>
        )}
        <p className="font-caption text-lg text-ink-primary">{content}</p>
      </div>
      <div className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-2 bg-point-red/20" />
    </div>
  );
}
