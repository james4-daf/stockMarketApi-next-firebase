'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomeAuthRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/watchlist');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return null;
  }

  return <>{children}</>;
}
