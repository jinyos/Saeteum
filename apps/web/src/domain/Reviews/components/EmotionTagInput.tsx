'use client';

import { EMOTION_TAGS, MAX_REVIEW_TAGS, type EmotionTag } from '@saeteum/shared';
import { EMOTION_TAG_LABEL } from '@/common/constants';

interface EmotionTagInputProps {
  value: EmotionTag[];
  onChange: (tags: EmotionTag[]) => void;
}

interface EmotionTagChipProps {
  tag: EmotionTag;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}

function EmotionTagChip({
  tag,
  selected,
  disabled,
  onToggle,
}: EmotionTagChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      aria-pressed={selected}
      className={`relative cursor-pointer rounded-full border-2 px-3 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? 'border-point-yellow bg-point-yellow/30 text-ink-primary'
          : 'border-ink-tertiary bg-base-paper text-ink-secondary'
      }`}
    >
      {EMOTION_TAG_LABEL[tag]}
    </button>
  );
}

export function EmotionTagInput({ value, onChange }: EmotionTagInputProps) {
  function toggle(tag: EmotionTag) {
    if (value.includes(tag)) {
      onChange(value.filter((selected) => selected !== tag));
      return;
    }

    if (value.length >= MAX_REVIEW_TAGS) {
      return;
    }

    onChange([...value, tag]);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-body text-sm text-ink-secondary">감정</span>
      <div className="flex flex-wrap gap-2" role="group" aria-label="감정 태그">
        {EMOTION_TAGS.map((tag) => (
          <EmotionTagChip
            key={tag}
            tag={tag}
            selected={value.includes(tag)}
            disabled={!value.includes(tag) && value.length >= MAX_REVIEW_TAGS}
            onToggle={() => toggle(tag)}
          />
        ))}
      </div>
    </div>
  );
}
