'use client';
import Header from '@/app/components/Sections/Header';
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
    return <LoginFull />; // Show centered login when not logged in
  }
  return (
    <div className="w-full min-h-screen max-w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg mx-auto px-2 sm:px-4 py-4">
      <Header />
      <div className="flex flex-col mx-auto">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
