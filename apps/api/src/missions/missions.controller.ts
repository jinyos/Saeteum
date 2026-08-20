import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('missions')
@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @ApiOperation({ summary: '오늘 뽑기 상태 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('today')
  getToday(@CurrentUser() user: { id: string }) {
    return this.missionsService.getTodayStatus(user.id);
  }

  @ApiOperation({ summary: '오늘의 미션 뽑기' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('draw')
  draw(@CurrentUser() user: { id: string }) {
    return this.missionsService.draw(user.id);
  }
}
