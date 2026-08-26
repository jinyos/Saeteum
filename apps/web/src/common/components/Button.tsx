import Link from 'next/link';
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

type ButtonStyleProps = {
  variant?: ButtonVariant;
  color?: PointColor;
  danger?: boolean;
  width?: string;
  height?: string;
  className?: string;
};

function getButtonClassName({
  variant = 'border',
  color,
  danger = false,
  width = '',
  height = '',
  className = '',
}: ButtonStyleProps) {
  if (variant === 'highlight') {
    return `relative inline-flex cursor-pointer items-center justify-center px-2 py-1 ${danger ? 'text-point-red' : 'text-ink-primary'} ${width} ${height} ${className}`;
  }

  return `inline-flex cursor-pointer items-center justify-center rounded-md border-2 border-ink-primary bg-base-paper px-4 py-2 text-ink-primary transition-colors active:scale-95 filter-[url(#hand-rough)] hover:filter-[url(#hand-rough-hover)] ${
    TINT_CLASS[color ?? 'base']
  } ${width} ${height} ${className}`;
}

function ButtonContent({
  variant = 'border',
  danger = false,
  children,
}: {
  variant?: ButtonVariant;
  danger?: boolean;
  children: React.ReactNode;
}) {
  if (variant === 'highlight') {
    return (
      <>
        <HighlightMark
          className={`${danger ? 'text-point-red' : 'text-point-yellow'} opacity-25 transition-opacity hover:opacity-50 active:opacity-50`}
        />
        <span className="relative">{children}</span>
      </>
    );
  }

  return children;
}

type AsButtonProps = ButtonStyleProps & {
  href?: undefined;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<'button'>, 'className'>;

type AsLinkProps = ButtonStyleProps & {
  href: string;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<typeof Link>, 'href' | 'className'>;

type ButtonProps = AsButtonProps | AsLinkProps;

export function Button({
  variant = 'border',
  color,
  danger = false,
  width = '',
  height = '',
  className = '',
  href,
  children,
  ...props
}: ButtonProps) {
  const buttonClassName = getButtonClassName({
    variant,
    color,
    danger,
    width,
    height,
    className,
  });

  if (href) {
    return (
      <Link
        href={href}
        className={buttonClassName}
        {...(props as Omit<AsLinkProps, keyof ButtonStyleProps | 'href' | 'children'>)}
      >
        <ButtonContent variant={variant} danger={danger}>
          {children}
        </ButtonContent>
      </Link>
    );
  }

  return (
    <button
      className={buttonClassName}
      {...(props as Omit<AsButtonProps, keyof ButtonStyleProps | 'href' | 'children'>)}
    >
      <ButtonContent variant={variant} danger={danger}>
        {children}
      </ButtonContent>
    </button>
  );
}
