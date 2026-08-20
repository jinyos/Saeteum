import { AppException } from '@/common/exceptions/app.exception';
import { GoogleProvider } from './implementations/google.provider';
import { KakaoProvider } from './implementations/kakao.provider';
import { NaverProvider } from './implementations/naver.provider';
import { OAuthProviderRegistry } from './oauth-provider.registry';

/**
 * 검증 포인트:
 * 1. provider 이름으로 해당 구현체를 찾는다
 * 2. 지원하지 않는 provider는 AppException을 발생시킨다.
 */
describe('OAuthProviderRegistry', () => {
  let registry: OAuthProviderRegistry;

  let google: GoogleProvider;
  let kakao: KakaoProvider;
  let naver: NaverProvider;

  beforeEach(() => {
    google = new GoogleProvider();
    kakao = new KakaoProvider();
    naver = new NaverProvider();

    registry = new OAuthProviderRegistry(google, kakao, naver);
  });

  // 1
  it('return corresponding provider for supported provider name', () => {
    expect(registry.get('google')).toBe(google);
    expect(registry.get('kakao')).toBe(kakao);
    expect(registry.get('naver')).toBe(naver);
  });

  // 2
  it('throw AppException for unsupported provider', () => {
    expect(() => registry.get('facebook')).toThrow(AppException);
  });
});
