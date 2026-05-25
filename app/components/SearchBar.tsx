'use client';

import { useStock } from '@/app/hooks/useStock';
import { SearchBarStocks } from '@/lib/types';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function SearchBar() {
  const { apiKey } = useStock();
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<SearchBarStocks[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!searchText.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/search?query=${searchText}&limit=5&apikey=${apiKey}`,
        );
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const data = await response.json();
        setSuggestions(data);
      } catch (err) {
        setError(`Error fetching suggestions, ${err}`);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchText, apiKey]);

  const stockSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchText.trim()) {
      setError('Ticker cannot be empty.');
      return;
    }
    router.push(`/${searchText.trim()}`);
    setSearchText('');
    setSuggestions([]);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={stockSearch} className="w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            className="w-full rounded-full border border-input bg-muted/50 py-2 pl-10 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={searchText}
            type="text"
            placeholder="Search ticker"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-xs text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </div>
      </form>

      {suggestions?.length > 0 && (
        <ul className="absolute left-0 top-full z-10 w-full rounded-b-md border border-border bg-background shadow-md">
          {suggestions.map((stock: SearchBarStocks, i) => (
            <li
              key={i}
              className="cursor-pointer border-b border-border p-2 text-sm last:border-0 hover:bg-muted"
              onClick={() => {
                router.push(`/${stock.symbol}`);
                setSearchText('');
                setSuggestions([]);
              }}
            >
              {stock.symbol} — {stock.name}
            </li>
          ))}
        </ul>
      )}

      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
    </div>
  );
}
