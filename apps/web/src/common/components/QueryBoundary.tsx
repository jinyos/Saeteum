import { Suspense, type ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Button } from '@/common/components/Button';

type ErrorFallbackProps = {
  resetErrorBoundary: () => void;
};

export function ErrorFallback({
  resetErrorBoundary,
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-ink-secondary">불러오지 못했어요.</p>
      <Button onClick={resetErrorBoundary}>다시 시도</Button>
    </div>
  );
}

type QueryBoundaryProps = {
  children: ReactNode;
  pendingFallback: ReactNode;
  errorFallback?: (props: FallbackProps) => ReactNode;
};

export function QueryBoundary({
  children,
  pendingFallback,
  errorFallback = ErrorFallback,
}: QueryBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} fallbackRender={errorFallback}>
          <Suspense fallback={pendingFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
