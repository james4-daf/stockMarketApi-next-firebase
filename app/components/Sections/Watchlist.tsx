import { Progress } from '@/app/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { getWatchlistData } from '@/app/firebase/firebase';
import { useAuth } from '@/app/hooks/useAuth';
import { useStock } from '@/app/hooks/useStock';
import { ChevronDown, ChevronUp } from 'lucide-react'; // Add at top with other imports
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type UserType = {
  uid: string;
};

export default function Watchlist() {
  const { user } = useAuth() as { user: UserType | null };
  const { apiKey } = useStock();

  const [watchlistStocks, setWatchlistStocks] = useState<string[]>([]);
  const [stockData, setStockData] = useState<
    Record<
      string,
      {
        price: number;
        changePercentage: number;
        range: string;
        progress: number;
      }
    >
  >({});
  const fetched = useRef(new Set<string>()); // Track fetched stocks
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortedStocks, setSortedStocks] = useState<string[]>([]);

  const sortStocks = (direction: 'asc' | 'desc') => {
    const sorted = [...watchlistStocks].sort((a, b) => {
      const changeA = stockData[a]?.changePercentage ?? 0;
      const changeB = stockData[b]?.changePercentage ?? 0;
      return direction === 'asc' ? changeA - changeB : changeB - changeA;
    });
    setSortedStocks(sorted);
    setSortDirection(direction);
  };

  useEffect(() => {
    if (watchlistStocks.length > 0) {
      sortStocks('desc');
    }
  }, [watchlistStocks, stockData]);

  //   useEffect(() => {
  //     sortStocks('desc');
  //   });

  useEffect(() => {
    if (user?.uid) {
      const getWatchlist = async () => {
        try {
          const data = await getWatchlistData(user.uid);
          setWatchlistStocks(data);
        } catch (error) {
          console.error('Error fetching watchlist:', error);
        }
      };
      getWatchlist();
    }
  }, [user]);

  const handleSort = () => {
    const direction = sortDirection === 'asc' ? 'desc' : 'asc';
    sortStocks(direction);
  };

  useEffect(() => {
    if (watchlistStocks.length === 0) return;

    const fetchStockData = async (stockTicker: string) => {
      if (!stockTicker || fetched.current.has(stockTicker)) return; // Prevent duplicate fetches

      fetched.current.add(stockTicker); // Mark as fetched

      try {
        const response = await fetch(
          `https://financialmodelingprep.com/stable/profile?symbol=${stockTicker}&apikey=${apiKey}`,
        );
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();
        if (!json || json.length === 0) return;

        const { price, changePercentage, range } = json[0]; // Grab only the required fields
        // Parse the range "121-141" into min and max
        const [low, high] = range.split('-').map(Number);

        // Calculate the progress percentage (clamped between 0 and 100)
        let progress = 0;
        if (!isNaN(low) && !isNaN(high) && high > low) {
          progress = ((price - low) / (high - low)) * 100;
          progress = Math.max(0, Math.min(100, progress)); // Clamp between 0 and 100
        }

        setStockData((prevData) => ({
          ...prevData,
          [stockTicker]: {
            price,
            changePercentage: changePercentage,
            range,
            progress,
          },
        }));
      } catch (error) {
        console.error(`Error fetching ${stockTicker}:`, error);
      }
    };

    watchlistStocks.forEach(fetchStockData);
  }, [watchlistStocks, apiKey]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Watchlist</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Ticker</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="cursor-pointer" onClick={handleSort}>
              Daily Change %
              {sortDirection === 'desc' ? (
                <ChevronDown className="inline-block w-4 h-4 ml-1" />
              ) : (
                <ChevronUp className="inline-block w-4 h-4 ml-1" />
              )}
            </TableHead>
            <TableHead className="text-right">52 Week Range</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStocks.map((stockTicker, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                <Link href={`/${stockTicker.toUpperCase()}`}>
                  {stockTicker.toUpperCase()}
                </Link>
              </TableCell>
              <TableCell>
                ${stockData[stockTicker]?.price.toFixed(2) ?? 'Loading...'}
              </TableCell>
              <TableCell
                className={
                  stockData[stockTicker]?.changePercentage >= 0
                    ? 'text-green-600'
                    : 'text-red-500'
                }
              >
                {stockData[stockTicker]?.changePercentage.toFixed(2) ??
                  'Loading...'}
                %
              </TableCell>
              <TableCell className="text-right">
                {stockData[stockTicker]?.range ?? 'Loading...'}
                <Progress value={stockData[stockTicker]?.progress ?? 0} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
