const WHITE_BAND_FILL =
  'M0,4 Q15,0 30,8 Q50,1 65,7 Q85,2 100,5 L100,15 Q92,18 84,14 Q76,20 68,15 Q60,21 52,14 Q44,19 36,14 Q28,20 20,15 Q12,17 6,14 Q3,19 0,14 Z';

const TORN_LINE_STROKE =
  'M100,15 Q92,18 84,14 Q76,20 68,15 Q60,21 52,14 Q44,19 36,14 Q28,20 20,15 Q12,17 6,14 Q3,19 0,14';

const WHITE_BAND_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 24' preserveAspectRatio='none'%3E%3Cpath d='${WHITE_BAND_FILL}' fill='white'/%3E%3C/svg%3E")`;

const TORN_LINE_SHADOW_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 24' preserveAspectRatio='none'%3E%3Cdefs%3E%3Cfilter id='b' x='-20%25' y='-100%25' width='140%25' height='300%25'%3E%3CfeGaussianBlur stdDeviation='1'/%3E%3C/filter%3E%3CclipPath id='c'%3E%3Cpath d='${WHITE_BAND_FILL}'/%3E%3C/clipPath%3E%3C/defs%3E%3Cg clip-path='url(%23c)'%3E%3Cpath d='${TORN_LINE_STROKE}' fill='none' stroke='white' stroke-width='3.5' filter='url(%23b)'/%3E%3C/g%3E%3C/svg%3E")`;

const RULED_LINES_BACKGROUND = `
  linear-gradient(to right, transparent 31px, color-mix(in srgb, var(--color-point-red) 25%, transparent) 31px, color-mix(in srgb, var(--color-point-red) 25%, transparent) 32px, transparent 32px),
  repeating-linear-gradient(to bottom, transparent 0, transparent 27px, color-mix(in srgb, var(--color-point-blue) 20%, transparent) 27px, color-mix(in srgb, var(--color-point-blue) 20%, transparent) 28px)
`;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-base-background">
      <div className="relative mx-auto min-h-dvh max-w-md">
        <div className="pt-2">
          <div
            className="mt-3 min-h-dvh bg-base-paper px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
            style={{ backgroundImage: RULED_LINES_BACKGROUND }}
          >
            {children}
          </div>
        </div>
        <div aria-hidden className="absolute inset-x-0 top-2 h-6">
          <div
            className="absolute inset-0 bg-white"
            style={{
              maskImage: WHITE_BAND_MASK,
              maskRepeat: 'no-repeat',
              maskSize: '100% 100%',
              WebkitMaskImage: WHITE_BAND_MASK,
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskSize: '100% 100%',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--color-ink-tertiary) 25%, white)',
              maskImage: TORN_LINE_SHADOW_MASK,
              maskRepeat: 'no-repeat',
              maskSize: '100% 100%',
              WebkitMaskImage: TORN_LINE_SHADOW_MASK,
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskSize: '100% 100%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
