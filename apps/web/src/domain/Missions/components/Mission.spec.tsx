/**
 * 검증 포인트:
 * 1. 안 뽑았으면 안내 문구를 보여준다.
 * 2. 뽑았으면 미션 내용을 보여준다.
 */
import { render, screen } from '@testing-library/react';
import { useTodayMission } from '@/domain/Missions/hooks/useTodayMission';
import { Mission } from './Mission';

jest.mock('@/domain/Missions/hooks/useTodayMission', () => ({
  useTodayMission: jest.fn(),
}));

const mockedUseTodayMission = jest.mocked(useTodayMission);

describe('Mission', () => {
  // 1
  it('show the placeholder text when not drawn', () => {
    mockedUseTodayMission.mockReturnValue({
      data: { drawn: false },
    } as unknown as ReturnType<typeof useTodayMission>);

    render(<Mission />);

    expect(screen.getByText(/아직 미션이 없어요/)).toBeInTheDocument();
  });

  // 2
  it('show the mission content when drawn', () => {
    mockedUseTodayMission.mockReturnValue({
      data: {
        drawn: true,
        missionDrawId: 'draw-1',
        mission: { content: '새로운 음악 장르 들어보기' },
        hasReview: false,
        drawnAt: '2026-08-26T00:00:00+09:00',
      },
    } as unknown as ReturnType<typeof useTodayMission>);

    render(<Mission />);

    expect(screen.getByText('새로운 음악 장르 들어보기')).toBeInTheDocument();
  });
});
