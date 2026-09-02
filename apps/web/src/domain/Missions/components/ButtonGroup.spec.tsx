/**
 * 검증 포인트:
 * 1. 아직 안 뽑았으면 "미션 뽑기" 버튼이 보이고 클릭 시 drawMission을 호출한다.
 * 2. 뽑는 중(isPending)이면 "미션 뽑기" 버튼이 비활성화된다.
 * 3. 뽑았고 후기가 없으면 "후기 작성하기" 링크(/reviews/new)가 보인다.
 * 4. 뽑았고 후기가 있으면 "후기 보기" 링크(/reviews/:missionDrawId)가 보인다.
 * 5. "기록 보기" 링크(/mypage/records)는 항상 보인다.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { useTodayMission } from '@/domain/Missions/hooks/useTodayMission';
import { useDrawMission } from '@/domain/Missions/hooks/useDrawMission';
import { ButtonGroup } from './ButtonGroup';

jest.mock('@/domain/Missions/hooks/useTodayMission', () => ({
  useTodayMission: jest.fn(),
}));
jest.mock('@/domain/Missions/hooks/useDrawMission', () => ({
  useDrawMission: jest.fn(),
}));

const mockedUseTodayMission = jest.mocked(useTodayMission);
const mockedUseDrawMission = jest.mocked(useDrawMission);

function mockTodayMission(
  drawn: boolean,
  options: { hasReview?: boolean; missionDrawId?: string } = {},
) {
  mockedUseTodayMission.mockReturnValue({
    data: drawn
      ? {
          drawn: true,
          hasReview: options.hasReview ?? false,
          missionDrawId: options.missionDrawId ?? 'draw-1',
        }
      : { drawn: false },
  } as unknown as ReturnType<typeof useTodayMission>);
}

function mockDrawMission({
  mutate = jest.fn(),
  isPending = false,
}: { mutate?: jest.Mock; isPending?: boolean } = {}) {
  mockedUseDrawMission.mockReturnValue({
    mutate,
    isPending,
  } as unknown as ReturnType<typeof useDrawMission>);
}

describe('ButtonGroup', () => {
  // 1
  it('show the draw button and call drawMission on click when not drawn', () => {
    mockTodayMission(false);
    const mutate = jest.fn();
    mockDrawMission({ mutate });

    render(<ButtonGroup />);

    fireEvent.click(screen.getByRole('button', { name: '미션 뽑기' }));

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  // 2
  it('disable the draw button while a draw is pending', () => {
    mockTodayMission(false);
    mockDrawMission({ isPending: true });

    render(<ButtonGroup />);

    expect(screen.getByRole('button', { name: '미션 뽑기' })).toBeDisabled();
  });

  // 3
  it('show the review-write link when drawn without a review', () => {
    mockTodayMission(true, { hasReview: false });
    mockDrawMission();

    render(<ButtonGroup />);

    expect(screen.getByRole('link', { name: '후기 작성하기' })).toHaveAttribute(
      'href',
      '/reviews/new',
    );
  });

  // 4
  it('show the review-view link when drawn with a review', () => {
    mockTodayMission(true, { hasReview: true, missionDrawId: 'draw-1' });
    mockDrawMission();

    render(<ButtonGroup />);

    expect(screen.getByRole('link', { name: '후기 보기' })).toHaveAttribute(
      'href',
      '/reviews/draw-1',
    );
  });

  // 5
  it('always show the records link', () => {
    mockTodayMission(false);
    mockDrawMission();

    render(<ButtonGroup />);

    expect(screen.getByRole('link', { name: '기록 보기' })).toHaveAttribute(
      'href',
      '/mypage/records',
    );
  });
});
