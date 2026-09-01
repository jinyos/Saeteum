/**
 * 검증 포인트:
 * 1. 태그를 클릭하면 선택 목록에 추가해서 onChange를 호출한다.
 * 2. 이미 선택된 태그를 클릭하면 목록에서 빼서 onChange를 호출한다.
 * 3. 3개 선택된 상태에서는 선택 안 된 태그가 비활성화된다.
 * 4. 선택된 태그는 aria-pressed가 true다.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { EMOTION_TAG_LABEL } from '@/common/constants';
import { EmotionTagInput } from './EmotionTagInput';

describe('EmotionTagInput', () => {
  // 1
  it('add the tag to the list on click', () => {
    const onChange = jest.fn();
    render(<EmotionTagInput value={[]} onChange={onChange} />);

    fireEvent.click(
      screen.getByRole('button', { name: EMOTION_TAG_LABEL.excitement }),
    );

    expect(onChange).toHaveBeenCalledWith(['excitement']);
  });

  // 2
  it('remove the tag from the list when it is already selected', () => {
    const onChange = jest.fn();
    render(
      <EmotionTagInput value={['excitement', 'joy']} onChange={onChange} />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: EMOTION_TAG_LABEL.excitement }),
    );

    expect(onChange).toHaveBeenCalledWith(['joy']);
  });

  // 3
  it('disable unselected tags once 3 are selected', () => {
    render(
      <EmotionTagInput
        value={['excitement', 'joy', 'pride']}
        onChange={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: EMOTION_TAG_LABEL.gratitude }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: EMOTION_TAG_LABEL.excitement }),
    ).not.toBeDisabled();
  });

  // 4
  it('mark selected tags as pressed', () => {
    render(<EmotionTagInput value={['excitement']} onChange={jest.fn()} />);

    expect(
      screen.getByRole('button', { name: EMOTION_TAG_LABEL.excitement }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: EMOTION_TAG_LABEL.joy }),
    ).toHaveAttribute('aria-pressed', 'false');
  });
});
