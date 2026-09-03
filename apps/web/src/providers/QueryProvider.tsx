'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { MS_PER_MINUTE } from '@saeteum/shared';
import { isApiError } from '@/api/client';
import { HTTP_STATUS, MAX_QUERY_RETRY_COUNT } from '@/common/constants';

function shouldRetry(failureCount: number, error: unknown) {
  if (
    isApiError(error) &&
    error.status >= HTTP_STATUS.BAD_REQUEST &&
    error.status < HTTP_STATUS.INTERNAL_SERVER_ERROR
  ) {
    return false;
  }

  return failureCount < MAX_QUERY_RETRY_COUNT;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: MS_PER_MINUTE,
            retry: shouldRetry,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
