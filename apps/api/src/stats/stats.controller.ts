import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { StatsService } from './stats.service';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @ApiOperation({ summary: '실시간 통계 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  getSummary(@CurrentUser() user: { id: string }) {
    return this.statsService.getSummary(user.id);
  }
}
