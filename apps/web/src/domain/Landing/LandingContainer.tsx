import { HighlightMark } from '@/common/components/HighlightMark';
import { Man } from '@/common/doodles/Man';
import { Woman } from '@/common/doodles/Woman';
import { LoginButton } from './components/LoginButton';

export default function LandingContainer() {
  return (
    <div className="flex min-h-full -translate-y-5 flex-col items-center justify-center gap-20 text-center">
      <div aria-hidden className="pointer-events-none fixed inset-0 mx-auto max-w-md">
        <Man className="absolute top-25 left-4 size-24 rotate-18 text-ink-tertiary opacity-50" />
        <Woman className="absolute top-12 right-4 size-24 -rotate-12 text-ink-tertiary opacity-50" />
      </div>

      <div className='flex flex-col gap-6'>
        <h1
          className="relative text-5xl"
          style={{ fontFamily: 'var(--font-heading-max)' }}
        >
          <HighlightMark
            className="text-point-red opacity-35"
            width="w-24"
            height="h-[150%]"
            top="top-[45%]"
          />
          <span className="relative">새틈</span>
        </h1>
        <p className="font-caption text-3xl">틈만 나면, 새로움!</p>
      </div>

      <LoginButton />
    </div>
  );
}
