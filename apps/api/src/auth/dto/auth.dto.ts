import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class ExchangeTokenDto extends createZodDto(
  z.object({ code: z.string().min(1) }),
) {}

export class RefreshTokenDto extends createZodDto(
  z.object({ refreshToken: z.string().min(1) }),
) {}
