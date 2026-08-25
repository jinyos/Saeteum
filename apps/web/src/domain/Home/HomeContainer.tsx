'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useOAuthCallback } from './hooks/useOAuthCallback';
import { Spinner } from '@/common/components/Spinner';
import LandingContainer from '@/domain/Landing/LandingContainer';
import MissionsContainer from '@/domain/Missions/components/MissionsContainer';

export default function HomeContainer() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isExchanging } = useOAuthCallback();

  if (isLoading || isExchanging) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Spinner className="size-16 text-ink-tertiary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingContainer />;
  }

  return <MissionsContainer />;
}
