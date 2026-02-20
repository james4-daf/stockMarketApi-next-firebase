'use client';
import CompanyIRReports from '@/app/components/Sections/CompanyIRReports';
import CompanyReports from '@/app/components/Sections/CompanyReports';
import Financials from '@/app/components/Sections/Financials';
import { db } from '@/app/firebase/firebase';
import { useAuth } from '@/app/hooks/useAuth';
import { StockProps } from '@/lib/types';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Sparkles } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AiSummaryModal } from '../components/AiSummaryModal';
import CompanyEarnings from '../components/Sections/CompanyEarnings';
import { StockDetails } from '../components/Sections/StockDetails';
import { Button } from '../components/ui/button';
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
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [stockData, setStockData] = useState<StockProps | null>(null);

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
          website,
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
          website,
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

        {/* AI Summary Button */}
        {stockData && (
          <div className="flex justify-center">
            <Button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="h-4 w-4" />
              AI Summary
            </Button>
          </div>
        )}
      </div>

      <Separator className="mt-6" />
      <Financials />
      <CompanyEarnings />
      <CompanyReports />
      {stockData?.website && (
        <CompanyIRReports
          website={stockData.website}
          ticker={stockTicker}
        />
      )}

      {/* AI Summary Modal */}
      <AiSummaryModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        stockTicker={stockTicker}
      />
    </div>
  );
}
