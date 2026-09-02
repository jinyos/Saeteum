import { Clover } from '@/common/doodles/Clover';
import { Flower } from '@/common/doodles/Flower';
import { PaperAirplane } from '@/common/doodles/PaperAirplane';
import { Smile } from '@/common/doodles/Smile';

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
      <svg aria-hidden className="absolute h-0 w-0">
        <defs>
          <filter
            id="hand-rough"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.2"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1.8"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter
            id="hand-rough-hover"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.12"
              numOctaves="2"
              seed="23"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div className="relative mx-auto min-h-dvh max-w-md">
        <div className="pt-2">
          <div
            className="mt-3 min-h-[calc(100dvh-1.25rem)] bg-base-paper px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
            style={{ backgroundImage: RULED_LINES_BACKGROUND }}
          >
            <div
              aria-hidden
              className="pointer-events-none fixed inset-0 mx-auto max-w-md"
            >
              <Clover className="absolute bottom-5 left-10 size-20 text-point-green opacity-30" />
              <Smile className="absolute bottom-20 left-25 size-20 text-point-yellow opacity-30" />
              <Flower className="absolute bottom-10 right-25 size-20 text-point-red opacity-30" />
              <PaperAirplane className="absolute bottom-30 right-5 size-18 text-point-blue opacity-30" />
            </div>
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
