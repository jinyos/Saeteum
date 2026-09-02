/**
 * 검증 포인트:
 * 1. rating이 null이면 별점 영역이 안 보인다.
 * 2. photoUrl이 없으면 사진이 안 보인다.
 * 3. content가 없으면 글 문단이 안 보인다.
 * 4. emotionTags가 비어있으면 태그 영역이 안 보인다.
 * 5. editable이 false면 삭제 버튼이 안 보인다.
 * 6. 삭제 버튼 클릭 -> 확인 다이얼로그에서 확인 누르면 onDelete를 호출한다.
 * 7. 나가기 링크는 항상 '/'로 간다.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import type { Review } from '@/api/reviews.api';
import { ReviewDetail } from './ReviewDetail';

function buildReview(overrides: Partial<Review> = {}): Review {
  return {
    reviewId: 'review-1',
    mission: { content: '근처 화단이나 풀밭 걸어보기' },
    rating: null,
    photoUrl: null,
    content: null,
    emotionTags: [],
    editable: true,
    ...overrides,
  };
}

describe('ReviewDetail', () => {
  // 1
  it('not show the rating stars when rating is null', () => {
    render(
      <ReviewDetail
        review={buildReview({ rating: null })}
        onDelete={jest.fn()}
        isDeleting={false}
      />,
    );

    expect(screen.queryByLabelText(/별점 \d점/)).not.toBeInTheDocument();
  });

  it('show the rating stars when rating is set', () => {
    render(
      <ReviewDetail
        review={buildReview({ rating: 4 })}
        onDelete={jest.fn()}
        isDeleting={false}
      />,
    );

    expect(screen.getByLabelText('별점 4점')).toBeInTheDocument();
  });

  // 2
  it('not show the photo when photoUrl is null', () => {
    render(
      <ReviewDetail
        review={buildReview({ photoUrl: null })}
        onDelete={jest.fn()}
        isDeleting={false}
      />,
    );

    expect(screen.queryByAltText('후기 사진')).not.toBeInTheDocument();
  });

  it('show the photo when photoUrl is set', () => {
    render(
      <ReviewDetail
        review={buildReview({ photoUrl: 'https://x/photo.jpg' })}
        onDelete={jest.fn()}
        isDeleting={false}
      />,
    );

    expect(screen.getByAltText('후기 사진')).toHaveAttribute(
      'src',
      'https://x/photo.jpg',
    );
  });

  // 3
  it('not show content when content is null', () => {
    render(
      <ReviewDetail
        review={buildReview({ content: null })}
        onDelete={jest.fn()}
        isDeleting={false}
      />,
    );

    expect(screen.queryByText('좋았다')).not.toBeInTheDocument();
  });

  it('show content when set', () => {
    render(
      <ReviewDetail
        review={buildReview({ content: '좋았다' })}
        onDelete={jest.fn()}
        isDeleting={false}
      />,
    );

    expect(screen.getByText('좋았다')).toBeInTheDocument();
  });

  // 4
  it('not show emotion tags when the list is empty', () => {
    render(
      <ReviewDetail
        review={buildReview({ emotionTags: [] })}
        onDelete={jest.fn()}
        isDeleting={false}
      />,
    );

    expect(screen.queryByText('설렘')).not.toBeInTheDocument();
  });

  it('show emotion tags when present', () => {
    render(
      <ReviewDetail
        review={buildReview({ emotionTags: ['excitement'] })}
        onDelete={jest.fn()}
        isDeleting={false}
      />,
    );

    expect(screen.getByText('설렘')).toBeInTheDocument();
  });

  // 5
  it('not show the delete button when not editable', () => {
    render(
      <ReviewDetail
        review={buildReview({ editable: false })}
        onDelete={jest.fn()}
        isDeleting={false}
      />,
    );

    expect(
      screen.queryByRole('button', { name: '삭제하기' }),
    ).not.toBeInTheDocument();
  });

  // 6
  it('call onDelete after confirming the delete dialog', () => {
    const onDelete = jest.fn();
    render(
      <ReviewDetail
        review={buildReview({ editable: true })}
        onDelete={onDelete}
        isDeleting={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '삭제하기' }));
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  // 7
  it('always show the exit link to home', () => {
    render(
      <ReviewDetail review={buildReview()} onDelete={jest.fn()} isDeleting={false} />,
    );

    expect(screen.getByRole('link', { name: '나가기' })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
