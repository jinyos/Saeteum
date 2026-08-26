import { Button } from '@/common/components/Button';
import { useTodayMission } from '@/domain/Missions/hooks/useTodayMission';
import { useDrawMission } from '@/domain/Missions/hooks/useDrawMission';

export function ButtonGroup() {
  const { data } = useTodayMission();
  const { mutate: drawMission, isPending } = useDrawMission();

  return (
    <div className="flex gap-4">
      {data.drawn ? (
        <Button href="/reviews/new" width="w-32" height="h-11" color="red">
          리뷰 작성하기
        </Button>
      ) : (
        <Button
          onClick={() => drawMission()}
          disabled={isPending}
          width="w-32"
          height="h-11"
          color="red"
        >
          미션 뽑기
        </Button>
      )}
      <Button href="/mypage/records" width="w-32" height="h-11" color="blue">
        기록 보기
      </Button>
    </div>
  );
}
