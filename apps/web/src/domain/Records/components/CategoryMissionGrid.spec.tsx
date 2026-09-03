/**
 * 검증 포인트:
 * 1. 뽑은 미션만큼 링크로 렌더되고, href가 카테고리/미션ID로 연결된다.
 * 2. 안 뽑은 미션은 링크가 아니라 비클릭 요소로 렌더된다.
 * 3. missions 배열 길이만큼 박스가 렌더된다.
 */
import { render, screen } from '@testing-library/react';
import { CategoryMissionGrid } from './CategoryMissionGrid';

describe('CategoryMissionGrid', () => {
  const missions = [
    { missionId: 1, drawn: true },
    { missionId: 2, drawn: false },
    { missionId: 3, drawn: true },
  ];

  it('render drawn missions as links to the mission record', () => {
    render(<CategoryMissionGrid category="nature" missions={missions} />);

    const links = screen.getAllByRole('link');

    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/mypage/records/nature/1');
    expect(links[1]).toHaveAttribute('href', '/mypage/records/nature/3');
  });

  it('render undrawn missions as non-interactive elements', () => {
    render(<CategoryMissionGrid category="nature" missions={missions} />);

    const undrawn = screen.getAllByLabelText('아직 뽑지 않은 미션');

    expect(undrawn).toHaveLength(1);
    expect(undrawn[0].tagName).not.toBe('A');
  });

  it('render a box for every mission in the list', () => {
    render(<CategoryMissionGrid category="nature" missions={missions} />);

    expect(
      screen.getAllByRole('link').length +
        screen.getAllByLabelText('아직 뽑지 않은 미션').length,
    ).toBe(missions.length);
  });
});
