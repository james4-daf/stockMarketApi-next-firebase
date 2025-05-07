import { useAuth } from '@/app/hooks/useAuth';
import { useStock } from '@/app/hooks/useStock';
import { notFound, useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

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
  const { user } = useAuth();
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
        const { symbol, mktCap, price, image, companyName } = json;
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
    <div className="earnings-list">
      <h2>Recent Earnings</h2>
      <ul>
        {earnings.map((item) => (
          <li key={item.date}>
            <div>
              <strong>Date:</strong> {item.date}
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
        ))}
      </ul>
    </div>
  );
};
export default CompanyEarnings;
