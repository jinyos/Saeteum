import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { authConfig } from './config/auth.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { StateService } from './tokens/state.service';
import { ExchangeCodeService } from './tokens/exchange-code.service';
import { TokenService } from './tokens/token.service';
import { UsersRepository } from './repositories/users.repository';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { TokenCleanupService } from './tokens/token-cleanup.service';
import { OAuthProviderRegistry } from './providers/oauth-provider.registry';
import { GoogleProvider } from './providers/implementations/google.provider';
import { KakaoProvider } from './providers/implementations/kakao.provider';
import { NaverProvider } from './providers/implementations/naver.provider';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: authConfig.jwtSecret,
      signOptions: { expiresIn: authConfig.accessTokenExpiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    StateService,
    ExchangeCodeService,
    TokenService,
    UsersRepository,
    RefreshTokensRepository,
    TokenCleanupService,
    OAuthProviderRegistry,
    GoogleProvider,
    KakaoProvider,
    NaverProvider,
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard, TokenService, JwtModule, UsersRepository],
})
export class AuthModule {}
