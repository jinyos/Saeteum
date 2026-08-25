let accessToken: string | null = null;
let listener: ((token: string | null) => void) | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  listener?.(token);
}

export function subscribeToAccessToken(
  onAccessTokenChange: (token: string | null) => void,
): () => void {
  listener = onAccessTokenChange;

  return () => {
    listener = null;
  };
}
