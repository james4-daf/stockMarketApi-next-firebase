'use client';

import { Card } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { useStock } from '@/app/hooks/useStock';
import { useEffect, useState } from 'react';

// ETF proxies — index symbols (^GSPC etc.) require a premium FMP quote endpoint
const INDICES = [
  { label: 'S&P 500', symbol: 'SPY' },
  { label: 'NASDAQ', symbol: 'QQQ' },
  { label: 'DOW', symbol: 'DIA' },
  { label: 'VIXY', symbol: 'VIXY' },
];

type IndexQuote = {
  label: string;
  symbol: string;
  price: number;
  changePercentage: number;
};

async function fetchProfileQuote(
  symbol: string,
  apiKey: string,
): Promise<{ price: number; changePercentage: number } | null> {
  const response = await fetch(
    `https://financialmodelingprep.com/stable/profile?symbol=${symbol}&apikey=${apiKey}`,
  );
  if (!response.ok) return null;

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return null;

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const { price, changePercentage } = data[0];
  return {
    price: price ?? 0,
    changePercentage: changePercentage ?? 0,
  };
}

export function MarketIndexCards() {
  const { apiKey } = useStock();
  const [quotes, setQuotes] = useState<IndexQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      if (!apiKey) return;
      setLoading(true);
      try {
        const results = await Promise.all(
          INDICES.map(async (idx) => {
            const quote = await fetchProfileQuote(idx.symbol, apiKey);
            return {
              label: idx.label,
              price: quote?.price ?? 0,
              changePercentage: quote?.changePercentage ?? 0,
            };
          }),
        );
        setQuotes(results);
      } catch (e) {
        console.error('Error fetching index quotes:', e);
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    };

    if (apiKey) fetchQuotes();
  }, [apiKey]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {INDICES.map((idx) => (
          <Skeleton key={idx.label} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (quotes.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {quotes.map((q) => (
        <Card
          key={q.label}
          className="border border-border bg-card p-4 shadow-sm"
        >
          <p className="text-xs font-medium text-muted-foreground">{q.label}</p>
          <p className="mt-1 text-lg font-semibold">
            {q.price > 0
              ? q.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '—'}
          </p>
          <p
            className={`text-sm font-medium ${
              q.changePercentage >= 0 ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {q.price > 0 ? (
              <>
                {q.changePercentage >= 0 ? '+' : ''}
                {q.changePercentage.toFixed(2)}%
              </>
            ) : (
              '—'
            )}
          </p>
        </Card>
      ))}
    </div>
  );
}
