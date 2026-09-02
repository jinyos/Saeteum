/**
 * 검증 포인트:
 * 1. 아무 것도 입력하지 않으면 저장 버튼이 비활성화된다.
 * 2. 넷 중 하나(별점)만 입력해도 저장 버튼이 활성화된다.
 * 3. 저장을 누르면 입력한 값 그대로 onSubmit을 호출한다.
 * 4. isSubmitting이면 저장 버튼이 비활성화된다.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { ReviewForm } from './ReviewForm';

describe('ReviewForm', () => {
  // 1
  it('disable the save button when nothing is filled in', () => {
    render(
      <ReviewForm
        missionContent="풀밭 걸어보기"
        onSubmit={jest.fn()}
        isSubmitting={false}
      />,
    );

    expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled();
  });

  // 2
  it('enable the save button once a rating is set', () => {
    render(
      <ReviewForm
        missionContent="풀밭 걸어보기"
        onSubmit={jest.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '별점 3점' }));

    expect(screen.getByRole('button', { name: '저장하기' })).not.toBeDisabled();
  });

  // 3
  it('call onSubmit with the entered values on save', () => {
    const onSubmit = jest.fn();
    render(
      <ReviewForm
        missionContent="풀밭 걸어보기"
        onSubmit={onSubmit}
        isSubmitting={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '별점 4점' }));
    fireEvent.change(screen.getByPlaceholderText('오늘 새틈은 어땠나요?'), {
      target: { value: '좋았다' },
    });

    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));

    expect(onSubmit).toHaveBeenCalledWith({
      rating: 4,
      content: '좋았다',
      emotionTags: [],
      photoFile: undefined,
    });
  });

  // 4
  it('disable the save button while submitting', () => {
    render(
      <ReviewForm
        missionContent="풀밭 걸어보기"
        onSubmit={jest.fn()}
        isSubmitting
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '별점 3점' }));

    expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled();
  });
});
