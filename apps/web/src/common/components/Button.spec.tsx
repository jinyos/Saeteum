/**
 * 검증 포인트:
 * 1. href가 있으면 해당 href의 링크로 렌더링된다.
 * 2. href가 없으면 button 요소로 렌더링되고 onClick이 동작한다.
 * 3. href가 없을 때만 disabled 같은 button 전용 속성이 적용된다.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  // 1
  it('render as a link with the given href', () => {
    render(<Button href="/mypage/records">기록 보기</Button>);

    expect(screen.getByRole('link', { name: '기록 보기' })).toHaveAttribute(
      'href',
      '/mypage/records',
    );
  });

  // 2
  it('render as a button and call onClick when href is not given', () => {
    const onClick = jest.fn();

    render(<Button onClick={onClick}>클릭</Button>);
    fireEvent.click(screen.getByRole('button', { name: '클릭' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // 3
  it('apply button-only props like disabled only when rendered as a button', () => {
    render(
      <Button disabled onClick={jest.fn()}>
        비활성
      </Button>,
    );

    expect(screen.getByRole('button', { name: '비활성' })).toBeDisabled();
  });
});
