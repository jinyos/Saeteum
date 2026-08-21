import Link from 'next/link';

export function IndexMark({
  href,
  label,
  active,
  activeColor = 'bg-point-yellow',
}: {
  href: string;
  label: string;
  active: boolean;
  activeColor?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-stretch overflow-hidden border text-xs ${
        active
          ? 'border-ink-secondary text-ink-primary'
          : 'border-ink-tertiary text-ink-secondary'
      }`}
    >
      <span className="px-2 py-0.5">{label}</span>
      <span
        className={`w-2 ${active ? activeColor : 'bg-ink-tertiary/30'}`}
      />
    </Link>
  );
}
