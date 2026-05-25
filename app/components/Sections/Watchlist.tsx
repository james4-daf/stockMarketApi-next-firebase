'use client';

import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Skeleton } from '@/app/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useAuth } from '@/app/hooks/useAuth';
import { useStock } from '@/app/hooks/useStock';
import { useWatchlistPortfolios } from '@/app/hooks/useWatchlistPortfolios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MarketIndexCards } from './MarketIndexCards';
import { RangeBar } from './RangeBar';

type StockRow = {
  price: number;
  changePercentage: number;
  range: string;
  progress: number;
  companyName: string;
  marketCap: number;
};

function formatMarketCap(cap: number) {
  if (cap >= 1e12) return `${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `${(cap / 1e6).toFixed(1)}M`;
  return cap.toString();
}

function formatEdtTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/New_York',
  });
}

export default function Watchlist() {
  const { user } = useAuth();
  const { apiKey } = useStock();
  const {
    portfolios,
    activePortfolioId,
    activeStocks,
    loading: portfoliosLoading,
    setActivePortfolioId,
    addPortfolio,
    addStock,
    removeStock,
  } = useWatchlistPortfolios(user?.uid);

  const [stockData, setStockData] = useState<Record<string, StockRow>>({});
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState('');
  const [addTicker, setAddTicker] = useState('');
  const [sortBy, setSortBy] = useState<'change-desc' | 'change-asc' | 'ticker'>(
    'change-desc',
  );
  const [editing, setEditing] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListOpen, setNewListOpen] = useState(false);
  const fetched = useRef(new Set<string>());

  useEffect(() => {
    fetched.current = new Set();
    setStockData({});
  }, [activePortfolioId]);

  useEffect(() => {
    if (activeStocks.length === 0) {
      setQuotesLoading(false);
      return;
    }

    setQuotesLoading(true);

    const fetchStockData = async (stockTicker: string) => {
      if (!stockTicker || fetched.current.has(stockTicker)) return;
      fetched.current.add(stockTicker);

      try {
        const response = await fetch(
          `https://financialmodelingprep.com/stable/profile?symbol=${stockTicker}&apikey=${apiKey}`,
        );
        if (!response.ok) return;

        const json = await response.json();
        if (!json?.length) return;

        const {
          price,
          changePercentage,
          range,
          companyName,
          marketCap,
        } = json[0];
        const [low, high] = (range || '0-0').split('-').map(Number);
        let progress = 0;
        if (!isNaN(low) && !isNaN(high) && high > low) {
          progress = ((price - low) / (high - low)) * 100;
          progress = Math.max(0, Math.min(100, progress));
        }

        setStockData((prev) => ({
          ...prev,
          [stockTicker]: {
            price,
            changePercentage,
            range,
            progress,
            companyName: companyName || '',
            marketCap: marketCap || 0,
          },
        }));
      } catch (error) {
        console.error(`Error fetching ${stockTicker}:`, error);
      }
    };

    Promise.all(activeStocks.map(fetchStockData)).then(() => {
      setQuotesLoading(false);
      setLastUpdated(new Date());
    });
  }, [activeStocks, apiKey]);

  const filteredStocks = useMemo(() => {
    const q = filter.trim().toLowerCase();
    let list = [...activeStocks];
    if (q) {
      list = list.filter((ticker) => {
        const data = stockData[ticker];
        return (
          ticker.toLowerCase().includes(q) ||
          data?.companyName?.toLowerCase().includes(q)
        );
      });
    }
    list.sort((a, b) => {
      if (sortBy === 'ticker') return a.localeCompare(b);
      const changeA = stockData[a]?.changePercentage ?? 0;
      const changeB = stockData[b]?.changePercentage ?? 0;
      return sortBy === 'change-asc' ? changeA - changeB : changeB - changeA;
    });
    return list;
  }, [activeStocks, filter, sortBy, stockData]);

  const handleAddStock = async () => {
    const ticker = addTicker.trim().toUpperCase();
    if (!ticker) return;
    await addStock(ticker);
    setAddTicker('');
  };

  const handleCreateList = async () => {
    const name = newListName.trim();
    if (!name) return;
    await addPortfolio(name);
    setNewListName('');
    setNewListOpen(false);
  };

  const symbolCount = activeStocks.length;
  const updatedLabel = lastUpdated
    ? formatEdtTime(lastUpdated)
    : '--:--';

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {symbolCount} symbol{symbolCount !== 1 ? 's' : ''} · Updated{' '}
          {updatedLabel} EDT
        </p>
      </div>

      <MarketIndexCards />

      {portfoliosLoading ? (
        <Skeleton className="h-10 w-full max-w-xl" />
      ) : (
        <div className="flex flex-wrap items-center gap-2 border-b border-border">
          <Tabs
            value={activePortfolioId}
            onValueChange={(id) => setActivePortfolioId(id)}
          >
            <TabsList className="h-auto gap-0 rounded-none bg-transparent p-0">
              {portfolios.map((p) => (
                <TabsTrigger
                  key={p.id}
                  value={p.id}
                  className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 shadow-none data-[state=active]:border-violet-600 data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                >
                  {p.name} {p.stocks.length}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Dialog open={newListOpen} onOpenChange={setNewListOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-violet-600">
                <Plus className="h-4 w-4" />
                New list
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new list</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="List name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
              />
              <DialogFooter>
                <Button onClick={handleCreateList}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Filter symbols..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-9 w-44"
        />
        <Input
          placeholder="Add symbol"
          value={addTicker}
          onChange={(e) => setAddTicker(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddStock()}
          className="h-9 w-36"
        />
        <Button
          onClick={handleAddStock}
          size="sm"
          className="h-9 shrink-0 bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Select
            value={sortBy}
            onValueChange={(v) =>
              setSortBy(v as 'change-desc' | 'change-asc' | 'ticker')
            }
          >
            <SelectTrigger className="h-9 w-[160px] border-0 bg-transparent text-sm text-muted-foreground shadow-none focus:ring-0">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="change-desc">Sort: change desc</SelectItem>
              <SelectItem value="change-asc">Sort: change asc</SelectItem>
              <SelectItem value="ticker">Sort: ticker A-Z</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-muted-foreground"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>

      {activeStocks.length === 0 && !portfoliosLoading && (
        <p className="py-12 text-center text-muted-foreground">
          This list is empty. Add a symbol above.
        </p>
      )}

      {quotesLoading && activeStocks.length > 0 ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : activeStocks.length > 0 ? (
        <div className="overflow-x-auto">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                {editing && <TableHead className="w-10 px-0" />}
                <TableHead className="w-[32%] pl-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Ticker
                </TableHead>
                <TableHead className="w-[14%] text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Price
                </TableHead>
                <TableHead className="w-[12%] text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Day %
                </TableHead>
                <TableHead className="w-[28%] text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  52-Week Range
                </TableHead>
                <TableHead className="w-[14%] pr-0 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Cap
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.map((stockTicker) => {
                const data = stockData[stockTicker];
                const [low, high] = (data?.range || '0-0')
                  .split('-')
                  .map(Number);

                return (
                  <TableRow key={stockTicker}>
                    {editing && (
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => removeStock(stockTicker)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    )}
                    <TableCell className="pl-0">
                      <Link
                        href={`/${stockTicker.toUpperCase()}`}
                        className="font-semibold hover:text-violet-600"
                      >
                        {stockTicker.toUpperCase()}
                      </Link>
                      {data?.companyName && (
                        <p className="text-xs text-muted-foreground">
                          {data.companyName}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium">
                      {data ? `$${data.price.toFixed(2)}` : (
                        <Skeleton className="h-4 w-16" />
                      )}
                    </TableCell>
                    <TableCell
                      className={`whitespace-nowrap ${
                        (data?.changePercentage ?? 0) >= 0
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      {data
                        ? `${data.changePercentage >= 0 ? '+' : ''}${data.changePercentage.toFixed(2)}%`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {data && !isNaN(low) && !isNaN(high) ? (
                        <RangeBar
                          low={low}
                          high={high}
                          progress={data.progress}
                        />
                      ) : (
                        <Skeleton className="h-8 w-32" />
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap pr-0 text-right text-muted-foreground">
                      {data?.marketCap
                        ? formatMarketCap(data.marketCap)
                        : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
