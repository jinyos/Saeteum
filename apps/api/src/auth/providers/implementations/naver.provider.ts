import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import {
  OAuthProfile,
  OAuthProvider,
} from '@/auth/providers/oauth-provider.interface';
import { authConfig } from '@/auth/config/auth.config';

interface NaverTokenResponse {
  access_token: string;
}

interface NaverProfileResponse {
  response: { id: string; name?: string; nickname?: string };
}

const DEFAULT_NICKNAME = '네이버 사용자';

@Injectable()
export class NaverProvider implements OAuthProvider {
  readonly name = 'naver' as const;

  buildAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: authConfig.providers.naver.clientId,
      redirect_uri: authConfig.providers.naver.redirectUri,
      state,
    });

    return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
  }

  async fetchProfile(code: string): Promise<OAuthProfile> {
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: authConfig.providers.naver.clientId,
      client_secret: authConfig.providers.naver.clientSecret,
      code,
    });

    const tokenResponse = await fetch(
      `https://nid.naver.com/oauth2.0/token?${tokenParams.toString()}`,
    );

    if (!tokenResponse.ok) {
      throw new AppException(
        'OAUTH_PROVIDER_ERROR',
        'Naver token exchange failed.',
      );
    }

    const { access_token } = (await tokenResponse.json()) as NaverTokenResponse;

    const profileResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!profileResponse.ok) {
      throw new AppException(
        'OAUTH_PROVIDER_ERROR',
        'Naver profile retrieval failed.',
      );
    }

    const profile = (await profileResponse.json()) as NaverProfileResponse;
    const nickname =
      profile.response.nickname ?? profile.response.name ?? DEFAULT_NICKNAME;

    return {
      providerId: profile.response.id,
      name: nickname,
    };
  }
}
