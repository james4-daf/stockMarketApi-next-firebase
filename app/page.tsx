'use client';
import Watchlist from '@/app/components/Sections/Watchlist';
import LoginFull from './components/LoginFull';
import { useAuth } from './hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();
  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <>
        <LoginFull />
      </>
    );
  }
  return (
    <div className="flex-1 px-4 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="">
          <Watchlist />
        </div>
      </div>
    </div>
  );
}
