'use client';

import { useAuth } from '@/app/hooks/useAuth';
import LoginFull from '../components/LoginFull';

export default function StockLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }
  if (!user) {
    return <LoginFull />;
  }
  return <div className="w-full">{children}</div>;
}
