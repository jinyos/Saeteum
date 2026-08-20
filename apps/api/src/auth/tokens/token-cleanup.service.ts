import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshTokensRepository } from '@/auth/repositories/refresh-tokens.repository';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(
    private readonly refreshTokensRepository: RefreshTokensRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Seoul' })
  async cleanupExpiredTokens(): Promise<void> {
    const deletedCount = await this.refreshTokensRepository.deleteExpired(
      new Date(),
    );

    if (deletedCount > 0) {
      this.logger.log(`Deleted ${deletedCount} expired refresh token(s).`);
    }
  }
}
