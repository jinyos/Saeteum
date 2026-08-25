import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/common/constants';

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/mypage/:path*', '/reviews/:path*'],
};
