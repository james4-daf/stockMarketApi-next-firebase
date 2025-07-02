import { Progress } from '@/app/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  getWatchlistData,
  removeStockFromWatchlist,
} from '@/app/firebase/firebase';
import { useAuth } from '@/app/hooks/useAuth';
import { useStock } from '@/app/hooks/useStock';
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Loader2,
  SquareCheckBig,
  Trash2,
} from 'lucide-react'; // Add Loader2
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Header from './Header';

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
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

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

  const handleRemoveStock = async (stockTicker: string) => {
    if (user?.uid) {
      setWatchlistStocks(
        watchlistStocks.filter((ticker) => ticker !== stockTicker),
      );
      await removeStockFromWatchlist(user.uid, stockTicker);
    }
  };

  useEffect(() => {
    if (watchlistStocks.length === 0) {
      setLoading(false);
    }

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

  useEffect(() => {
    // Set loading to true when watchlist changes
    setLoading(true);
  }, [watchlistStocks.length]);

  useEffect(() => {
    // Set loading to false when all stock data is loaded
    if (
      watchlistStocks.length > 0 &&
      watchlistStocks.every((ticker) => stockData[ticker])
    ) {
      setLoading(false);
    }
  }, [stockData, watchlistStocks]);

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      <Header />
      <div className="relative flex items-center w-full my-8">
        <div className="flex-1" />
        <h2 className="text-2xl font-bold text-center flex-1">Watchlist</h2>
        <div className="flex-1 flex justify-end">
          {!editing ? (
            <div className="flex items-center gap-2">
              <p>Edit</p>
              <Edit
                className="cursor-pointer hover:bg-brand hover:rounded-sm"
                onClick={() => setEditing(!editing)}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p>Done</p>
              <SquareCheckBig
                className="cursor-pointer hover:bg-green-500 hover:rounded-sm"
                onClick={() => setEditing(!editing)}
              />
            </div>
          )}
        </div>
      </div>
      {watchlistStocks.length === 0 && (
        <div className="flex justify-center">
          <p className="text-sm text-gray-500">Watchlist is empty</p>
        </div>
      )}
      {loading ? (
        <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table className="max-w-3xl mx-auto">
          <TableHeader>
            <TableRow>
              {editing && <TableHead className="w-[100px]"></TableHead>}
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
                {editing && (
                  <TableCell>
                    <Trash2
                      className="cursor-pointer hover:bg-red-500 hover:rounded-sm"
                      onClick={() => handleRemoveStock(stockTicker)}
                    />
                  </TableCell>
                )}
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
      )}
    </div>
  );
}
