import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RecordsService } from './records.service';

@ApiTags('records')
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @ApiOperation({ summary: '카테고리 상세 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('categories/:category')
  getCategoryDetail(
    @CurrentUser() user: { id: string },
    @Param('category') category: string,
  ) {
    return this.recordsService.getCategoryDetail(user.id, category);
  }

  @ApiOperation({ summary: '미션별 전체 뽑기 기록' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('missions/:missionId')
  getMissionDetail(
    @CurrentUser() user: { id: string },
    @Param('missionId', ParseIntPipe) missionId: number,
  ) {
    return this.recordsService.getMissionDetail(user.id, missionId);
  }
}
