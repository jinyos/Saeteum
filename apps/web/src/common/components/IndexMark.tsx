import Link from 'next/link';

type IndexMarkSize = 'sm' | 'lg';

type IndexMarkProps = {
  href?: string;
  label: React.ReactNode;
  active: boolean;
  activeColor?: string;
  size?: IndexMarkSize;
  className?: string;
};

const SIZE_CLASS: Record<
  IndexMarkSize,
  { root: string; label: string; bar: string }
> = {
  sm: {
    root: 'border-2 text-xs filter-[url(#hand-rough)]',
    label: 'px-4 py-0.5',
    bar: 'w-2',
  },
  lg: {
    root: 'w-full border-2 text-lg bg-white filter-[url(#hand-rough)]',
    label: 'flex-1 py-3 text-center',
    bar: 'w-6',
  },
};

export function IndexMark({
  href,
  label,
  active,
  activeColor = 'bg-point-yellow',
  size = 'sm',
  className = '',
}: IndexMarkProps) {
  const sizeClass = SIZE_CLASS[size];
  const rootClassName = `inline-flex items-stretch justify-between overflow-hidden ${
    href ? 'transition-transform active:scale-[0.98]' : ''
  } ${sizeClass.root} ${
    active
      ? 'border-ink-secondary text-ink-primary'
      : 'border-ink-tertiary text-ink-secondary'
  } ${className}`;
  const content = (
    <>
      <span className={sizeClass.label}>{label}</span>
      <span
        className={`${sizeClass.bar} ${active ? activeColor : 'bg-ink-tertiary/30'}`}
      />
    </>
  );

  if (!href) {
    return <div className={rootClassName}>{content}</div>;
  }

  return (
    <Link href={href} className={rootClassName}>
      {content}
    </Link>
  );
}
