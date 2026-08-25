import { HighlightMark } from '@/common/components/HighlightMark';

type ButtonVariant = 'border' | 'highlight';
type PointColor = 'red' | 'yellow' | 'blue' | 'green';

const TINT_CLASS: Record<PointColor | 'base', string> = {
  red: 'hover:bg-point-red/40',
  yellow: 'hover:bg-point-yellow/40',
  blue: 'hover:bg-point-blue/40',
  green: 'hover:bg-point-green/40',
  base: 'hover:bg-base-background',
};

type ButtonProps = {
  variant?: ButtonVariant;
  color?: PointColor;
  danger?: boolean;
  width?: string;
  height?: string;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<'button'>;

export function Button({
  variant = 'border',
  color,
  danger = false,
  width = '',
  height = '',
  className = '',
  children,
  ...props
}: ButtonProps) {
  if (variant === 'highlight') {
    return (
      <button
        className={`relative cursor-pointer px-2 py-1 ${danger ? 'text-point-red' : 'text-ink-primary'} ${width} ${height} ${className}`}
        {...props}
      >
        <HighlightMark
          className={`${danger ? 'text-point-red' : 'text-point-yellow'} opacity-25 transition-opacity hover:opacity-50 active:opacity-50`}
        />
        <span className="relative">{children}</span>
      </button>
    );
  }

  return (
    <button
      className={`cursor-pointer rounded-md border-2 border-ink-primary px-4 py-2 text-ink-primary transition-colors active:scale-95 filter-[url(#hand-rough)] hover:filter-[url(#hand-rough-hover)] ${
        TINT_CLASS[color ?? 'base']
      } ${width} ${height} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
