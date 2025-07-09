'use client';

import { useStock } from '@/app/hooks/useStock';
import { SearchBarStocks } from '@/lib/types';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function SearchBar() {
  const { apiKey } = useStock();
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<SearchBarStocks[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    <div className="relative w-full ">
      <form onSubmit={stockSearch} className=" w-full">
        <div className="  ">
          <input
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            value={searchText}
            type="text"
            placeholder="Enter a stock ticker e.g. TSLA"
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => {}}
          />
          {searchText ? (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
              onClick={() => {
                setSearchText('');
                setSuggestions([]);
              }}
            >
              ❌
            </button>
          ) : (
            <button
              type="button"
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
              onClick={() => {
                setSearchText('');
                setSuggestions([]);
              }}
            >
              <Search />
            </button>
          )}
        </div>{' '}
      </form>

      {suggestions?.length > 0 && (
        <ul className="absolute w-full z-10 top-full left-0 bg-white border-x border-b border-gray-300 rounded-b-md shadow-md">
          {suggestions.map((stock: SearchBarStocks, i) => (
            <div key={i}>
              <li
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  router.push(`/${stock.symbol}`);
                  setSearchText('');
                  setSuggestions([]);
                }}
              >
                {stock.symbol} - {stock.name}
              </li>
              <hr className="border-gray-200" />
            </div>
          ))}
        </ul>
      )}

      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}
