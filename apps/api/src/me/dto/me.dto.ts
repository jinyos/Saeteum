import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class UpdateMeDto extends createZodDto(
  z.object({
    nickname: z.string().trim().min(1).max(20),
  }),
) {}
