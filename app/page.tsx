'use client';
import { SearchBar } from '@/app/components/SearchBar';
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
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <SearchBar />
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Watchlist />
        </div>
      </div>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
