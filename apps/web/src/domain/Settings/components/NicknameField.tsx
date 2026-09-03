'use client';

import { useState } from 'react';
import { Button } from '@/common/components/Button';

interface NicknameFieldProps {
  nickname: string;
  onSave: (nickname: string) => void;
  isSaving: boolean;
}

export function NicknameField({
  nickname,
  onSave,
  isSaving,
}: NicknameFieldProps) {
  const [value, setValue] = useState(nickname);

  const trimmedValue = value.trim();
  const canSave =
    !isSaving && trimmedValue.length > 0 && trimmedValue !== nickname;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!canSave) {
      return;
    }

    onSave(trimmedValue);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <span className="font-body text-sm text-ink-secondary">닉네임</span>
      <div className="flex gap-3">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={20}
          className="flex-1 rounded-md border-2 border-ink-primary bg-base-paper px-3 py-2 font-caption text-ink-primary filter-[url(#hand-rough)] focus:outline-none"
        />
        <Button type="submit" disabled={!canSave}>
          저장
        </Button>
      </div>
    </form>
  );
}
