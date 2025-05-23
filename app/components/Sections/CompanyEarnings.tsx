import { useFetchWithApiLimit } from '@/app/hooks/useFetchWithApiLimit';
import { useStock } from '@/app/hooks/useStock';
import { notFound, useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { Separator } from '../ui/separator';

interface Earnings {
  symbol: string;
  date: string;
  epsActual: number | null;
  epsEstimated: number | null;
  revenueActual: number | null;
  revenueEstimated: number | null;
  lastUpdated: string;
}

export function formatDifference(amount: number): string {
  const absAmount = Math.abs(amount);

  if (absAmount >= 1e9) {
    return `${(amount / 1e9).toFixed(1)}B`;
  } else if (absAmount >= 1e6) {
    return `${(amount / 1e6).toFixed(1)}M`;
  } else if (absAmount >= 1e3) {
    return `${(amount / 1e3).toFixed(1)}K`;
  } else {
    return amount.toFixed(1);
  }
}

const CompanyEarnings = () => {
  const { apiKey } = useStock();
  const { fetchWithApiLimit, apiError, clearError } = useFetchWithApiLimit();
  const [earnings, setEarnings] = useState<Earnings[]>([]);
  const [earningsMiss, setEarningsMiss] = useState<boolean | null>(null);

  const params = useParams<{ stockTicker: string }>();
  const { stockTicker } = params;
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getPercentageDifference = (actual: number, estimated: number) => {
    const diff = ((actual - estimated) / estimated) * 100;
    return {
      value: Math.abs(diff).toFixed(1),
      isPositive: diff >= 0,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };
  const formatNumber = (num: number) => {
    return num.toFixed(3);
  };

  const fetched = useRef(false);
  useEffect(() => {
    if (!stockTicker || fetched.current) return;
    fetched.current = true;
    const fetchStock = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `https://financialmodelingprep.com/stable/earnings?symbol=${stockTicker}&limit=5&apikey=${apiKey}`,
        );
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const json = await response.json();
        if (!json || json.length === 0) {
          notFound(); // ❌ Triggers Next.js 404 page
          return;
        }
        console.log(json);
        // setStockData({ symbol, mktCap, price, image, companyName });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };
    // if (error || !stockData) return notFound();
    fetchStock();
  }, [stockTicker, apiKey]);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await fetch(
          `https://financialmodelingprep.com/stable/earnings?symbol=${stockTicker}&limit=5&apikey=${apiKey}`,
        ); // Replace with your actual API endpoint
        const data: Earnings[] = await response.json();
        // if epsActual is more than epsEstimated, use setEarningsMiss to true else false
        if (
          data.some(
            (item) =>
              item.epsActual !== null &&
              item.epsEstimated !== null &&
              item.epsActual > item.epsEstimated,
          )
        ) {
          setEarningsMiss(false);
        } else {
          setEarningsMiss(true);
        }

        // Filter out objects where epsActual is null
        const filteredEarnings = data.filter((item) => item.epsActual !== null);

        // Sort by date, most recent first
        filteredEarnings.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        setEarnings(filteredEarnings);
      } catch (error) {
        console.error('Error fetching earnings data:', error);
      }
    };

    fetchEarnings();
  }, []);

  return (
    <>
      {apiError && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 z-50">
          {apiError}
          <button onClick={clearError} className="ml-4 underline">
            Dismiss
          </button>
        </div>
      )}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {earnings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
          <h3 className="text-xl font-semibold mb-6">Recent Earnings</h3>
          <ul>
            {earnings.map((item) => {
              const isNew =
                new Date(item.date) >
                new Date(new Date().setMonth(new Date().getMonth() - 1));

              return (
                <li
                  key={item.date}
                  className="mb-4 border-b border-gray-200 last:border-none pb-6 last:pb-0"
                >
                  <strong className="mr-2"> {item.date}</strong>
                  {isNew && (
                    <span className=" bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      NEW
                    </span>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-m font-semibold text-gray-500 mb-2">
                          EPS
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">
                              Estimated
                            </div>
                            <div className="font-medium">
                              {item.epsEstimated}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Actual</div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {item.epsActual}
                              </span>
                              {item.epsActual !== null &&
                                item.epsEstimated !== null &&
                                item.epsActual !== item.epsEstimated && (
                                  <span
                                    className={`text-xs ${
                                      item.epsActual >= item.epsEstimated
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}
                                  >
                                    {item.epsActual > item.epsEstimated
                                      ? '↑'
                                      : '↓'}
                                    {
                                      getPercentageDifference(
                                        item.epsActual,
                                        item.epsEstimated,
                                      ).value
                                    }
                                    %
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-m font-semibold text-gray-500 mb-2 ">
                          Revenue
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">
                              Estimated
                            </div>
                            <div className="font-medium">
                              {formatCurrency(item?.revenueEstimated)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Actual</div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {formatCurrency(item.revenueActual)}
                              </span>
                              {item.revenueActual !== item.revenueEstimated && (
                                <span
                                  className={`text-xs ${
                                    item.revenueActual >= item.revenueEstimated
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {item.revenueActual > item.revenueEstimated
                                    ? '↑'
                                    : '↓'}
                                  {formatDifference(
                                    item.revenueActual - item.revenueEstimated,
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};
export default CompanyEarnings;
