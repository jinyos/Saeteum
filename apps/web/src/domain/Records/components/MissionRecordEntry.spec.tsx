/**
 * 검증 포인트:
 * 1. 뽑은 날짜를 표시한다.
 * 2. 후기가 없으면 "후기를 남기지 않았어요" 안내만 보여준다.
 * 3. 후기의 별점이 없으면 별점 영역이 안 보인다.
 * 4. 후기의 별점이 있으면 별점 영역이 보인다.
 * 5. 사진/글/감정 태그가 있으면 각각 보여준다.
 */
import { render, screen } from '@testing-library/react';
import type { MissionDraw } from '@/api/records.api';
import { MissionRecordEntry } from './MissionRecordEntry';

function buildDraw(overrides: Partial<MissionDraw> = {}): MissionDraw {
  return {
    missionDrawId: 'draw-1',
    drawnAt: '2026-08-19T00:00:00+09:00',
    review: null,
    ...overrides,
  };
}

function formatExpectedDate(drawnAt: string) {
  return new Date(drawnAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

describe('MissionRecordEntry', () => {
  // 1
  it('show the drawn date', () => {
    const draw = buildDraw({ drawnAt: '2026-08-19T00:00:00+09:00' });
    render(<MissionRecordEntry draw={draw} />);

    expect(
      screen.getByText(formatExpectedDate(draw.drawnAt)),
    ).toBeInTheDocument();
  });

  // 2
  it('show the empty state when there is no review', () => {
    render(<MissionRecordEntry draw={buildDraw({ review: null })} />);

    expect(screen.getByText('후기를 남기지 않았어요')).toBeInTheDocument();
    expect(screen.queryByLabelText(/별점 \d점/)).not.toBeInTheDocument();
  });

  // 3
  it('not show the rating when the review has no rating', () => {
    render(
      <MissionRecordEntry
        draw={buildDraw({
          review: {
            rating: null,
            photoUrl: null,
            content: null,
            emotionTags: [],
          },
        })}
      />,
    );

    expect(screen.queryByLabelText(/별점 \d점/)).not.toBeInTheDocument();
  });

  // 4
  it('show the rating when the review has one', () => {
    render(
      <MissionRecordEntry
        draw={buildDraw({
          review: {
            rating: 4,
            photoUrl: null,
            content: null,
            emotionTags: [],
          },
        })}
      />,
    );

    expect(screen.getByLabelText('별점 4점')).toBeInTheDocument();
  });

  // 5
  it('show the photo, content and emotion tags when present', () => {
    render(
      <MissionRecordEntry
        draw={buildDraw({
          review: {
            rating: null,
            photoUrl: 'https://x/photo.jpg',
            content: '좋았다',
            emotionTags: ['excitement'],
          },
        })}
      />,
    );

    expect(screen.getByAltText('후기 사진')).toHaveAttribute(
      'src',
      'https://x/photo.jpg',
    );
    expect(screen.getByText('좋았다')).toBeInTheDocument();
    expect(screen.getByText('설렘')).toBeInTheDocument();
  });
});
