'use client';

interface ContentInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export function ContentInput({ value, onChange }: ContentInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-body text-sm text-ink-secondary">문장</span>
      <textarea
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder="오늘 새틈은 어땠나요?"
        rows={2}
        className="h-36 w-full resize-none rounded-md border-2 border-ink-primary bg-base-paper p-3 font-caption text-ink-primary placeholder:text-ink-tertiary filter-[url(#hand-rough)] focus:outline-none"
      />
    </div>
  );
}
