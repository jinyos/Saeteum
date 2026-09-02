'use client';

import { useState } from 'react';
import type { EmotionTag } from '@saeteum/shared';
import { Button } from '@/common/components/Button';
import { MissionCard } from './MissionCard';
import { RatingInput } from './RatingInput';
import { PhotoInput } from './PhotoInput';
import { ContentInput } from './ContentInput';
import { EmotionTagInput } from './EmotionTagInput';

export interface ReviewFormValues {
  rating?: number;
  content?: string;
  emotionTags?: EmotionTag[];
  photoFile?: File;
}

interface ReviewFormProps {
  missionContent: string;
  onSubmit: (values: ReviewFormValues) => void;
  isSubmitting: boolean;
}

export function ReviewForm({
  missionContent,
  onSubmit,
  isSubmitting,
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>();
  const [content, setContent] = useState<string>();
  const [emotionTags, setEmotionTags] = useState<EmotionTag[]>([]);
  const [photoFile, setPhotoFile] = useState<File>();

  const canSubmit =
    rating !== undefined ||
    !!content?.trim() ||
    photoFile !== undefined ||
    emotionTags.length > 0;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!canSubmit || isSubmitting) {
      return;
    }

    onSubmit({ rating, content, emotionTags, photoFile });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <MissionCard content={missionContent} />

      <RatingInput value={rating} onChange={setRating} />
      <PhotoInput value={photoFile} onChange={setPhotoFile} />
      <ContentInput value={content} onChange={setContent} />
      <EmotionTagInput value={emotionTags} onChange={setEmotionTags} />

      <div className="mt-4 flex justify-center gap-12">
        <Button
          href="/"
          variant="highlight"
          highlightWidth="w-14"
          highlightHeight="h-[85%]"
        >
          나가기
        </Button>
        <Button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          variant="highlight"
          highlightWidth="w-18"
          highlightHeight="h-[85%]"
        >
          저장하기
        </Button>
      </div>
    </form>
  );
}
