'use client';
import { useOpenOrClosed } from '@/app/hooks/useOpenOrClosed';
import Link from 'next/link';

export default function Header() {
  const { loading, error, openOrClosed } = useOpenOrClosed();
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-center gap-2">
        <p className="text-sm font-light">Stock Market is:</p>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p
            className={`${
              openOrClosed ? 'text-green-500' : 'text-red-500'
            } text-sm`}
          >
            {openOrClosed ? ' Open' : ' Closed'}
          </p>
        )}
      </div>
      <div className="flex items-center justify-center gap-2">
        <Link href="/">Home</Link>
        <Link href="/watchlist">Watchlist</Link>
      </div>
    </div>
  );
}
