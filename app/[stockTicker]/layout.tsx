'use client';
import Header from '@/app/components/Sections/Header';
import { useAuth } from '@/app/hooks/useAuth';
import LoginFull from '../components/LoginFull';
import { AppSidebar } from '../components/Sections/AppSidebar';

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
    <>
      <Header />
      <div className="flex gap-[20px] flex-col items-center">
        <AppSidebar /> {/* Sidebar only appears for authenticated users */}
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}
