import { providerEnum } from '@/db/schema';

const supportedProviders = providerEnum.enumValues;
export type SupportedProvider = (typeof supportedProviders)[number];

export interface OAuthProfile {
  providerId: string;
  name: string;
}

export interface OAuthProvider {
  readonly name: SupportedProvider;
  buildAuthorizeUrl(state: string): string;
  fetchProfile(code: string): Promise<OAuthProfile>;
}

export function isSupportedProvider(value: string): value is SupportedProvider {
  return (supportedProviders as readonly string[]).includes(value);
}
