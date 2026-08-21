import { Menu } from 'lucide-react';
import Link from 'next/link';
import { HighlightMark } from '@/common/layouts/HighlightMark';
import { NavLink } from '@/common/layouts/NavLink';

type HeaderVariant = 'none' | 'icon' | 'nav';

export function Header({ variant }: { variant: HeaderVariant }) {
  if (variant === 'none') {
    return null;
  }

  return (
    <header className="flex items-center justify-between pt-4 pb-1">
      <Link
        href="/"
        className="relative -ml-3 px-3 py-2.5 text-xl text-ink-primary"
        style={{ fontFamily: 'var(--font-heading-max)' }}
      >
        <HighlightMark className="text-point-red opacity-35" />
        <span className="relative">새틈</span>
      </Link>
      {variant === 'icon' && (
        <Link href="/mypage/settings" aria-label="설정">
          <Menu className="size-6 text-ink-primary" />
        </Link>
      )}
      {variant === 'nav' && (
        <nav className="flex text-base text-ink-primary">
          <NavLink href="/mypage/records">기록</NavLink>
          <NavLink
            href="/mypage/stats"
            activePaths={['/mypage/stats', '/mypage/insights']}
          >
            분석
          </NavLink>
          <NavLink href="/mypage/settings" className="-mr-3">
            설정
          </NavLink>
        </nav>
      )}
    </header>
  );
}
