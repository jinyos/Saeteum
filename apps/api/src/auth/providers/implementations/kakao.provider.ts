import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import {
  OAuthProfile,
  OAuthProvider,
} from '@/auth/providers/oauth-provider.interface';
import { authConfig } from '@/auth/config/auth.config';

interface KakaoTokenResponse {
  access_token: string;
}

interface KakaoProfileResponse {
  id: number;
  kakao_account?: { profile?: { nickname?: string } };
  properties?: { nickname?: string };
}

const DEFAULT_NICKNAME = '카카오 사용자';

@Injectable()
export class KakaoProvider implements OAuthProvider {
  readonly name = 'kakao' as const;

  buildAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: authConfig.providers.kakao.clientId,
      redirect_uri: authConfig.providers.kakao.redirectUri,
      response_type: 'code',
      scope: 'profile_nickname',
      state,
    });

    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  }

  async fetchProfile(code: string): Promise<OAuthProfile> {
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: authConfig.providers.kakao.clientId,
      redirect_uri: authConfig.providers.kakao.redirectUri,
      code,
    });

    if (authConfig.providers.kakao.clientSecret) {
      tokenParams.set('client_secret', authConfig.providers.kakao.clientSecret);
    }

    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });

    if (!tokenResponse.ok) {
      throw new AppException(
        'OAUTH_PROVIDER_ERROR',
        'Kakao token exchange failed.',
      );
    }

    const { access_token } = (await tokenResponse.json()) as KakaoTokenResponse;

    const profileResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!profileResponse.ok) {
      throw new AppException(
        'OAUTH_PROVIDER_ERROR',
        'Kakao profile retrieval failed.',
      );
    }

    const profile = (await profileResponse.json()) as KakaoProfileResponse;
    const nickname =
      profile.kakao_account?.profile?.nickname ??
      profile.properties?.nickname ??
      DEFAULT_NICKNAME;

    return { providerId: String(profile.id), name: nickname };
  }
}
