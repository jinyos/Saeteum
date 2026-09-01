/**
 * 검증 포인트:
 * 1. 이미지가 아닌 파일을 선택하면 에러 토스트를 띄우고 onChange를 호출하지 않는다.
 * 2. 10MB를 초과하는 파일을 선택하면 에러 토스트를 띄우고 onChange를 호출하지 않는다.
 * 3. 유효한 이미지 파일을 선택하면 onChange(file)을 호출한다.
 * 4. 미리보기 상태에서 삭제 버튼을 누르면 onChange(undefined)를 호출한다.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { toast } from 'sonner';
import { PhotoInput } from './PhotoInput';

jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));

const mockedToastError = jest.mocked(toast.error);

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();
});

beforeEach(() => {
  mockedToastError.mockReset();
});

function getFileInput(container: HTMLElement) {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

describe('PhotoInput', () => {
  // 1
  it('show an error toast and not call onChange for a non-image file', () => {
    const onChange = jest.fn();
    const { container } = render(
      <PhotoInput value={undefined} onChange={onChange} />,
    );
    const file = new File(['x'], 'a.txt', { type: 'text/plain' });

    fireEvent.change(getFileInput(container), { target: { files: [file] } });

    expect(mockedToastError).toHaveBeenCalledWith('이미지 파일만 올릴 수 있어요.');
    expect(onChange).not.toHaveBeenCalled();
  });

  // 2
  it('show an error toast and not call onChange for a file over 10MB', () => {
    const onChange = jest.fn();
    const { container } = render(
      <PhotoInput value={undefined} onChange={onChange} />,
    );
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });

    fireEvent.change(getFileInput(container), { target: { files: [file] } });

    expect(mockedToastError).toHaveBeenCalledWith('사진은 10MB까지 올릴 수 있어요.');
    expect(onChange).not.toHaveBeenCalled();
  });

  // 3
  it('call onChange with the file for a valid image', () => {
    const onChange = jest.fn();
    const { container } = render(
      <PhotoInput value={undefined} onChange={onChange} />,
    );
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });

    fireEvent.change(getFileInput(container), { target: { files: [file] } });

    expect(onChange).toHaveBeenCalledWith(file);
  });

  // 4
  it('call onChange with undefined when the delete button is clicked', () => {
    const onChange = jest.fn();
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    render(<PhotoInput value={file} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '사진 삭제' }));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
