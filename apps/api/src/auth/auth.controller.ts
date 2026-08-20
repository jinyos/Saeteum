import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ExchangeTokenDto, RefreshTokenDto } from './dto/auth.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '소셜 로그인' })
  @Get(':provider/login')
  @Redirect()
  login(@Param('provider') provider: string, @Query('next') next = '/') {
    const url = this.authService.buildLoginRedirectUrl(provider, next);

    return { url };
  }

  @ApiOperation({ summary: '로그인 콜백' })
  @Get(':provider/callback')
  @Redirect()
  async callback(
    @Param('provider') provider: string,
    @Query('state') state: string,
    @Query('code') code: string,
  ) {
    const url = await this.authService.handleCallback(provider, state, code);

    return { url };
  }

  @ApiOperation({ summary: '1회용 code를 token으로 교환' })
  @Post('token')
  exchangeToken(@Body() dto: ExchangeTokenDto) {
    return this.authService.exchangeCode(dto.code);
  }

  @ApiOperation({ summary: 'Access token 재발급' })
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @ApiOperation({ summary: '로그아웃' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: { id: string },
    @Body() dto: RefreshTokenDto,
  ): Promise<void> {
    await this.authService.logout(user.id, dto.refreshToken);
  }
}
