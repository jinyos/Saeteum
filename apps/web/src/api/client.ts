import { API_BASE_URL, HTTP_STATUS } from '@/common/constants';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

type SuccessEnvelope<T> = { data: T };
type ErrorEnvelope = { error: { code: string; message: string } };

async function parseError(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => null)) as ErrorEnvelope | null;

  return new ApiError(
    res.status,
    body?.error?.code ?? 'UNKNOWN_ERROR',
    body?.error?.message ?? `Request failed with status ${res.status}`,
  );
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  accessToken: string | null = null,
): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    throw await parseError(res);
  }

  if (res.status === HTTP_STATUS.NO_CONTENT) {
    return undefined as T;
  }

  const body = (await res.json()) as SuccessEnvelope<T>;
  return body.data;
}
