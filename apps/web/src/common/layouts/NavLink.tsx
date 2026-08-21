'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HighlightMark } from '@/common/layouts/HighlightMark';

export function NavLink({
  href,
  children,
  className = '',
  activePaths,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  activePaths?: string[];
}) {
  const pathname = usePathname();
  const isActive = (activePaths ?? [href]).some((path) =>
    pathname.startsWith(path),
  );

  return (
    <Link href={href} className={`relative px-3 py-2.5 ${className}`}>
      {isActive && (
        <HighlightMark className="text-point-yellow opacity-40" />
      )}
      <span className="relative">{children}</span>
    </Link>
  );
}
