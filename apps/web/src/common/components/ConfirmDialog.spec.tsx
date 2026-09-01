/**
 * 검증 포인트:
 * 1. open이 false면 아무것도 렌더링하지 않는다.
 * 2. open이 true면 메시지와 버튼을 보여준다.
 * 3. 취소 버튼을 누르면 onCancel을 호출한다.
 * 4. 확인 버튼을 누르면 onConfirm을 호출한다.
 * 5. Escape 키를 누르면 onCancel을 호출한다.
 * 6. 오버레이를 클릭하면 onCancel을 호출하고, 다이얼로그 내부 클릭은 전파되지 않는다.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  // 1
  it('render nothing when closed', () => {
    render(
      <ConfirmDialog
        open={false}
        message="삭제할까요?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  // 2
  it('show the message and buttons when open', () => {
    render(
      <ConfirmDialog
        open
        message="삭제할까요?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByText('삭제할까요?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  // 3
  it('call onCancel when the cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(
      <ConfirmDialog
        open
        message="삭제할까요?"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // 4
  it('call onConfirm when the confirm button is clicked', () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmDialog
        open
        message="삭제할까요?"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '확인' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  // 5
  it('call onCancel when Escape is pressed', () => {
    const onCancel = jest.fn();
    render(
      <ConfirmDialog
        open
        message="삭제할까요?"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // 6
  it('call onCancel on overlay click but not on inner click', () => {
    const onCancel = jest.fn();
    render(
      <ConfirmDialog
        open
        message="삭제할까요?"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByText('삭제할까요?'));
    expect(onCancel).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('alertdialog').parentElement as HTMLElement);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
