import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UpdateMeDto } from './dto/me.dto';
import { MeService } from './me.service';

@ApiTags('me')
@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @ApiOperation({ summary: '내 정보 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  getMe(@CurrentUser() user: { id: string }) {
    return this.meService.getMe(user.id);
  }

  @ApiOperation({ summary: '닉네임 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch()
  updateNickname(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateMeDto,
  ) {
    return this.meService.updateNickname(user.id, dto.nickname);
  }

  @ApiOperation({ summary: '탈퇴' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteMe(@CurrentUser() user: { id: string }) {
    return this.meService.deleteMe(user.id);
  }
}
