import type { EmotionTag } from '@saeteum/shared';
import { authorizedFetch } from '@/lib/auth/authorizedFetch';

export interface CreateReviewInput {
  missionDrawId: string;
  rating?: number;
  photoPath?: string;
  content?: string;
  emotionTags?: EmotionTag[];
}

export interface CreateReviewResult {
  reviewId: string;
}

export interface ReviewPhotoUploadTicket {
  uploadUrl: string;
  photoPath: string;
}

export interface Review {
  reviewId: string;
  mission: { content: string };
  rating: number | null;
  photoUrl: string | null;
  content: string | null;
  emotionTags: EmotionTag[];
  editable: boolean;
}

export function createReview(
  input: CreateReviewInput,
): Promise<CreateReviewResult> {
  return authorizedFetch<CreateReviewResult>('/reviews', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getReviewPhotoUploadTicket(): Promise<ReviewPhotoUploadTicket> {
  return authorizedFetch<ReviewPhotoUploadTicket>('/reviews/photos', {
    method: 'POST',
  });
}

export async function uploadReviewPhoto(
  uploadUrl: string,
  file: File,
): Promise<void> {
  const body = new FormData();
  body.append('cacheControl', '3600');
  body.append('', file);

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body,
    headers: { 'x-upsert': 'false' },
  });

  if (!res.ok) {
    throw new Error('사진 업로드에 실패했어요.');
  }
}

export function getReview(missionDrawId: string): Promise<Review> {
  return authorizedFetch<Review>(`/reviews/${missionDrawId}`);
}

export function deleteReview(reviewId: string): Promise<void> {
  return authorizedFetch<void>(`/reviews/${reviewId}`, {
    method: 'DELETE',
  });
}
