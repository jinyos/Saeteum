export const PROVIDERS = ['google', 'kakao', 'naver'] as const;

export type Provider = (typeof PROVIDERS)[number];
