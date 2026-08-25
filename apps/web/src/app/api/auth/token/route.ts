import { z } from 'zod';
import { apiFetch, isApiError } from '@/api/client';
import { setRefreshTokenCookie } from '@/lib/auth/refreshTokenCookie';
import { HTTP_STATUS } from '@/common/constants';
import { NextRequest, NextResponse } from 'next/server';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

const bodySchema = z.object({ code: z.string().min(1) });

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'code is required.',
        },
      },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  const { code } = parsed.data;

  try {
    const tokens = await apiFetch<TokenResponse>('/auth/token', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });

    await setRefreshTokenCookie(tokens.refreshToken);

    return NextResponse.json({ data: { accessToken: tokens.accessToken } });
  } catch (error) {
    if (!isApiError(error)) {
      throw error;
    }

    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }
}
