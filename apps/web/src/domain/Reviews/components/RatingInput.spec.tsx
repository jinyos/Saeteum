/**
 * 검증 포인트:
 * 1. 별을 클릭하면 그 번호로 onChange를 호출한다.
 * 2. 이미 선택된 별을 다시 클릭하면 undefined로 onChange를 호출한다(취소).
 * 3. value 이하의 별들만 aria-pressed가 true다.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { RatingInput } from './RatingInput';

describe('RatingInput', () => {
  // 1
  it('call onChange with the clicked star number', () => {
    const onChange = jest.fn();
    render(<RatingInput value={undefined} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '별점 3점' }));

    expect(onChange).toHaveBeenCalledWith(3);
  });

  // 2
  it('call onChange with undefined when clicking the already selected star', () => {
    const onChange = jest.fn();
    render(<RatingInput value={3} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '별점 3점' }));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  // 3
  it('mark only stars up to value as pressed', () => {
    render(<RatingInput value={3} onChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: '별점 1점' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: '별점 3점' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: '별점 4점' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
