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
    <div className=" min-h-screen md:max-w-3xl lg:max-w-6xl mx-auto px-4 py-8">
      <Header />
      <div className="flex flex-col mx-auto">
        <AppSidebar /> {/* Sidebar only appears for authenticated users */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
