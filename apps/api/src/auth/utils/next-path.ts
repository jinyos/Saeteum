export function normalizeNextPath(next: string): string {
  const isInternalPath =
    next.startsWith('/') && next[1] !== '/' && next[1] !== '\\';

  return isInternalPath ? next : '/';
}
