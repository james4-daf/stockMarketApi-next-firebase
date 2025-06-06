// hooks/useKeyFeatures.ts
import { useStock } from '@/app/hooks/useStock';
import { useEffect, useState } from 'react';

interface KeyFeatures {
  peRatioTTM: number;
  dividendYielPercentageTTM: number;
  payoutRatioTTM: number;
}

export function useKeyFeatures(stockTicker: string | undefined) {
  const { apiKey } = useStock();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [keyFeaturesData, setKeyFeaturesData] = useState<KeyFeatures | null>(
    null,
  );

  useEffect(() => {
    if (!stockTicker) return;

    const fetchKeyFeatureStockData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/ratios-ttm/${stockTicker}?apikey=${apiKey}`,
        );
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const json = await response.json();
        const { peRatioTTM, dividendYielPercentageTTM, payoutRatioTTM } =
          json[0];
        setKeyFeaturesData({
          peRatioTTM,
          dividendYielPercentageTTM,
          payoutRatioTTM,
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchKeyFeatureStockData();
  }, [stockTicker, apiKey]);

  return { loading, error, keyFeaturesData };
}
