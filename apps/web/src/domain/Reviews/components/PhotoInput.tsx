'use client';

import { useEffect, useMemo, useRef } from 'react';
import { ImageUp, X } from 'lucide-react';
import { toast } from 'sonner';
import { MAX_PHOTO_SIZE_BYTES } from '@/common/constants';

interface PhotoInputProps {
  value: File | undefined;
  onChange: (file: File | undefined) => void;
}

export function PhotoInput({ value, onChange }: PhotoInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(
    () => (value ? URL.createObjectURL(value) : undefined),
    [value],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 올릴 수 있어요.');
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      toast.error('사진은 10MB까지 올릴 수 있어요.');
      return;
    }

    onChange(file);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-body text-sm text-ink-secondary">사진</span>
      {previewUrl ? (
        <div className="relative h-24 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="첨부한 사진 미리보기"
            className="h-full w-full rounded-md border-2 border-ink-primary object-cover filter-[url(#hand-rough)]"
          />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="사진 삭제"
            className="absolute -top-2 -right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-ink-primary bg-base-paper"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-ink-tertiary text-ink-tertiary"
          >
            <ImageUp size={28} strokeWidth={1.5} />
            <span className="text-xs">탭해서 사진 추가</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}
