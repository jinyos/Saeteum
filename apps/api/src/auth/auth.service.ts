import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { authConfig } from './config/auth.config';
import { OAuthProviderRegistry } from './providers/oauth-provider.registry';
import { StateService } from './tokens/state.service';
import {
  ExchangeCodePayload,
  ExchangeCodeService,
} from './tokens/exchange-code.service';
import { TokenService } from './tokens/token.service';
import { User, UsersRepository } from './repositories/users.repository';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { normalizeNextPath } from './utils/next-path';
import {
  OAuthProfile,
  SupportedProvider,
} from './providers/oauth-provider.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly registry: OAuthProviderRegistry,
    private readonly stateService: StateService,
    private readonly exchangeCodeService: ExchangeCodeService,
    private readonly tokenService: TokenService,
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
  ) {}

  buildLoginRedirectUrl(providerName: string, next: string): string {
    const provider = this.registry.get(providerName);
    const state = this.stateService.sign(normalizeNextPath(next));

    return provider.buildAuthorizeUrl(state);
  }

  async handleCallback(
    providerName: string,
    state: string,
    code: string,
  ): Promise<string> {
    const provider = this.registry.get(providerName);
    const verifiedState = this.stateService.verify(state);

    if (!verifiedState) {
      throw new AppException('VALIDATION_ERROR', 'Invalid state.');
    }

    const profile = await provider.fetchProfile(code);
    const user = await this.resolveUser(provider.name, profile);
    const { accessToken, refreshToken } = await this.issueTokens(user.id);
    const exchangeCode = this.exchangeCodeService.issue({
      accessToken,
      refreshToken,
    });

    const next = normalizeNextPath(verifiedState.next);
    const params = new URLSearchParams({ code: exchangeCode });

    return `${authConfig.webOrigin}${next}?${params.toString()}`;
  }

  private async resolveUser(
    provider: SupportedProvider,
    profile: OAuthProfile,
  ): Promise<User> {
    const existingUser = await this.usersRepository.findByProvider(
      provider,
      profile.providerId,
    );

    if (existingUser) {
      return existingUser;
    }

    return this.usersRepository.create({
      provider,
      providerId: profile.providerId,
      nickname: profile.name,
    });
  }

  private async issueTokens(userId: string): Promise<ExchangeCodePayload> {
    const accessToken = this.tokenService.issueAccessToken(userId);
    const refreshToken = this.tokenService.issueRefreshToken();

    await this.refreshTokensRepository.create({
      userId,
      tokenHash: this.tokenService.hashRefreshToken(refreshToken),
      expiresAt: this.tokenService.refreshTokenExpiresAt(),
    });

    return { accessToken, refreshToken };
  }

  exchangeCode(code: string): ExchangeCodePayload {
    const payload = this.exchangeCodeService.consume(code);

    if (!payload) {
      throw new AppException('INVALID_OAUTH_CODE', 'Invalid exchange code.');
    }

    return payload;
  }

  async refresh(refreshToken: string): Promise<ExchangeCodePayload> {
    const currentTokenHash = this.tokenService.hashRefreshToken(refreshToken);
    const storedToken =
      await this.refreshTokensRepository.findByTokenHash(currentTokenHash);

    if (!storedToken || storedToken.expiresAt.getTime() <= Date.now()) {
      throw new AppException('INVALID_REFRESH_TOKEN', 'Invalid refresh token.');
    }

    const accessToken = this.tokenService.issueAccessToken(storedToken.userId);
    const newRefreshToken = this.tokenService.issueRefreshToken();

    const rotated = await this.refreshTokensRepository.rotate(
      storedToken.id,
      currentTokenHash,
      {
        tokenHash: this.tokenService.hashRefreshToken(newRefreshToken),
        expiresAt: this.tokenService.refreshTokenExpiresAt(),
      },
    );

    if (!rotated) {
      throw new AppException('INVALID_REFRESH_TOKEN', 'Invalid refresh token.');
    }

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);

    await this.refreshTokensRepository.deleteByUserAndHash(userId, tokenHash);
  }
}
