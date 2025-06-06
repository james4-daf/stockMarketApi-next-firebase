'use client';
import CompanyReports from '@/app/components/Sections/CompanyReports';
import Financials from '@/app/components/Sections/Financials';
import { db } from '@/app/firebase/firebase';
import { useAuth } from '@/app/hooks/useAuth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import CompanyEarnings from '../components/Sections/CompanyEarnings';
import { StockDetails } from '../components/Sections/StockDetails';
import { Separator } from '../components/ui/separator';
import { useStock } from '../hooks/useStock';

export default function StockPage() {
  const { user } = useAuth();
  const { apiKey } = useStock();

  const params = useParams<{ stockTicker: string }>();
  const { stockTicker } = params;
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<{
    symbol: string;
    marketCap: number;
    price: number;
    image: string;
    companyName: string;
    range: string;
    change: number;
    changePercentage: number;
  } | null>(null);

  const fetched = useRef(false);

  useEffect(() => {
    if (!stockTicker || fetched.current) return;
    fetched.current = true;
    const fetchStock = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `https://financialmodelingprep.com/stable/profile?symbol=${stockTicker}&apikey=${apiKey}`,
        );
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const json = await response.json();
        if (!json || json.length === 0) {
          notFound(); // ❌ Triggers Next.js 404 page
          return;
        }
        const {
          symbol,
          marketCap,
          price,
          image,
          companyName,
          range,
          change,
          changePercentage,
        } = json[0];
        setStockData({
          symbol,
          marketCap,
          price,
          image,
          companyName,
          range,
          change,
          changePercentage,
        });
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
    if (!user?.uid || !stockTicker) return;

    const checkWatchlist = async () => {
      try {
        const normalizedTicker = stockTicker.toUpperCase();
        const watchlistRef = doc(db, 'watchlist', user.uid);
        const watchlistSnap = await getDoc(watchlistRef);

        if (watchlistSnap.exists()) {
          const stocks = watchlistSnap.data().stocks || [];

          // Check for the normalized ticker (case-insensitive)
          const inList = stocks.some(
            (stock: string) => stock.toUpperCase() === normalizedTicker,
          );

          setInWatchlist(inList);
        }
      } catch (error) {
        console.error('Error checking watchlist:', error);
      }
    };

    checkWatchlist();
  }, [user, stockTicker]);

  const toggleWatchlist = async () => {
    if (!user?.uid || !stockTicker) return;

    const normalizedTicker = stockTicker.toUpperCase();
    const watchlistRef = doc(db, 'watchlist', user.uid);

    try {
      const watchlistSnap = await getDoc(watchlistRef);
      if (watchlistSnap.exists()) {
        const stocks = watchlistSnap.data().stocks || [];
        const tickerExists = stocks.some(
          (stock: string) => stock.toUpperCase() === normalizedTicker,
        );
        const updatedStocks = tickerExists
          ? stocks.filter(
              (stock: string) => stock.toUpperCase() !== normalizedTicker,
            ) // Remove stock
          : [
              ...stocks.filter(
                (stock: string, index: number) =>
                  stocks.indexOf(stock) === index,
              ),
              normalizedTicker,
            ]; // Add stock

        await updateDoc(watchlistRef, { stocks: updatedStocks });
        setInWatchlist(!inWatchlist);
      } else {
        await setDoc(watchlistRef, { stocks: [normalizedTicker] }); // Create document if missing
        setInWatchlist(true);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {stockData && (
          <StockDetails
            stockData={stockData}
            inWatchlist={inWatchlist}
            toggleWatchlist={toggleWatchlist}
          />
        )}
        {loading && <p>Loading stock data...</p>}

        {error && <p className="text-red-500">Error: {error}</p>}
      </div>
      <Separator className="mt-6" />
      <Financials />
      <CompanyEarnings />
      <CompanyReports />
    </div>
  );
}
