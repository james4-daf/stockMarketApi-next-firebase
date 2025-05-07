'use client';
import { SearchBar } from '@/app/components/SearchBar';
import Watchlist from '@/app/components/Sections/Watchlist';
import Login from './components/Login';
import CompanyEarnings from './components/Sections/CompanyEarnings';
import { useAuth } from './hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();
  if (loading) {
    return null;
  }

  if (!user) {
    return <Login />; // Show centered login when not logged in
  }
  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <SearchBar />
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Watchlist />
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
