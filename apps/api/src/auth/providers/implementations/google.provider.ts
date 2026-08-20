import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import {
  OAuthProfile,
  OAuthProvider,
} from '@/auth/providers/oauth-provider.interface';
import { authConfig } from '@/auth/config/auth.config';

interface GoogleTokenResponse {
  access_token: string;
}

interface GoogleProfileResponse {
  sub: string;
  name?: string;
}

const DEFAULT_NICKNAME = '구글 사용자';

@Injectable()
export class GoogleProvider implements OAuthProvider {
  readonly name = 'google' as const;

  buildAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: authConfig.providers.google.clientId,
      redirect_uri: authConfig.providers.google.redirectUri,
      response_type: 'code',
      scope: 'openid profile',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async fetchProfile(code: string): Promise<OAuthProfile> {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: authConfig.providers.google.clientId,
        client_secret: authConfig.providers.google.clientSecret,
        redirect_uri: authConfig.providers.google.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new AppException(
        'OAUTH_PROVIDER_ERROR',
        'Google token exchange failed.',
      );
    }

    const { access_token } =
      (await tokenResponse.json()) as GoogleTokenResponse;

    const profileResponse = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      { headers: { Authorization: `Bearer ${access_token}` } },
    );

    if (!profileResponse.ok) {
      throw new AppException(
        'OAUTH_PROVIDER_ERROR',
        'Google profile retrieval failed.',
      );
    }

    const profile = (await profileResponse.json()) as GoogleProfileResponse;
    const nickname = profile.name ?? DEFAULT_NICKNAME;

    return { providerId: profile.sub, name: nickname };
  }
}
