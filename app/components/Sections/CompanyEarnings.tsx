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

const CompanyEarnings = () => {
  const { apiKey } = useStock();
  const [earnings, setEarnings] = useState<Earnings[]>([]);

  const params = useParams<{ stockTicker: string }>();
  const { stockTicker } = params;
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {earnings.length > 0 && (
        <div className="earnings-list">
          <Separator />
          <h2>Recent Earnings</h2>
          <ul>
            {earnings.map((item) => {
              const isNew =
                new Date(item.date) >
                new Date(new Date().setMonth(new Date().getMonth() - 1));

              return (
                <li key={item.date} className="mb-4">
                  <div className="flex items-center gap-2">
                    <strong>Date:</strong> {item.date}
                    {isNew && (
                      <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <div>
                    <strong>EPS Actual:</strong> {item.epsActual}
                  </div>
                  <div>
                    <strong>EPS Estimated:</strong> {item.epsEstimated}
                  </div>
                  <div>
                    <strong>Revenue Actual:</strong>{' '}
                    {item.revenueActual
                      ? `$${item.revenueActual.toLocaleString()}`
                      : 'N/A'}
                  </div>
                  <div>
                    <strong>Revenue Estimated:</strong>{' '}
                    {item.revenueEstimated
                      ? `$${item.revenueEstimated.toLocaleString()}`
                      : 'N/A'}
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
