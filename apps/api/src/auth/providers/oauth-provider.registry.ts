import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import {
  isSupportedProvider,
  OAuthProvider,
  SupportedProvider,
} from './oauth-provider.interface';
import { GoogleProvider } from './implementations/google.provider';
import { KakaoProvider } from './implementations/kakao.provider';
import { NaverProvider } from './implementations/naver.provider';

@Injectable()
export class OAuthProviderRegistry {
  private readonly providers: Record<SupportedProvider, OAuthProvider>;

  constructor(
    google: GoogleProvider,
    kakao: KakaoProvider,
    naver: NaverProvider,
  ) {
    this.providers = { google, kakao, naver };
  }

  get(name: string): OAuthProvider {
    if (!isSupportedProvider(name)) {
      throw new AppException(
        'VALIDATION_ERROR',
        `Unsupported provider: ${name}`,
      );
    }

    return this.providers[name];
  }
}
