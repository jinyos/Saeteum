import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { EMOTION_TAGS } from '@saeteum/shared';

export class CreateReviewDto extends createZodDto(
  z.object({
    missionDrawId: z.uuid(),
    rating: z.number().int().min(1).max(5).optional(),
    photoPath: z.string().optional(),
    content: z.string().optional(),
    emotionTags: z.array(z.enum(EMOTION_TAGS)).optional(),
  }),
) {}
