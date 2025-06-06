// hooks/useKeyFeatures.ts
import { useStock } from '@/app/hooks/useStock';
import { useEffect, useState } from 'react';

export function useOpenOrClosed() {
  const { apiKey } = useStock();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openOrClosed, setOpenOrClosed] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchOpenHours = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `https://financialmodelingprep.com/stable/exchange-market-hours?exchange=NASDAQ&apikey=${apiKey}`,
        );
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const json = await response.json();
        const { isMarketOpen } = json[0];
        setOpenOrClosed(isMarketOpen);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchOpenHours();
  }, [apiKey]);

  return { loading, error, openOrClosed };
}
