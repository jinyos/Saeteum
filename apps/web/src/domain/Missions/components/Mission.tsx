import { useTodayMission } from '@/domain/Missions/hooks/useTodayMission';

export function Mission() {
  const { data } = useTodayMission();

  return (
    <div className="relative mx-auto flex aspect-square w-4/5 -rotate-2 items-center justify-center bg-white px-8 text-center shadow-md filter-[url(#hand-rough)] border-2 border-ink-primary">
      <div className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-2 bg-point-red/20" />
      {data.drawn ? (
        <p className="font-caption text-2xl text-ink-primary">
          {data.mission.content}
        </p>
      ) : (
        <p className="font-caption text-2xl text-ink-secondary">
          아직 미션이 없어요.
          <br />
          미션을 뽑아보세요!
        </p>
      )}
    </div>
  );
}
