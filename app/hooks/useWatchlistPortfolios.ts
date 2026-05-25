'use client';

import {
  addStockToPortfolio,
  createPortfolio,
  getWatchlistDoc,
  removeStockFromPortfolio,
  setActivePortfolio,
} from '@/app/firebase/firebase';
import { Portfolio } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';

export function useWatchlistPortfolios(userId: string | undefined) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioIdState] = useState('default');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setPortfolios([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const doc = await getWatchlistDoc(userId);
      setPortfolios(doc.portfolios);
      setActivePortfolioIdState(doc.activePortfolioId);
    } catch (e) {
      console.error('Error loading watchlist:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activePortfolio =
    portfolios.find((p) => p.id === activePortfolioId) ?? portfolios[0];

  const setActivePortfolioId = async (portfolioId: string) => {
    if (!userId) return;
    setActivePortfolioIdState(portfolioId);
    await setActivePortfolio(userId, portfolioId);
  };

  const addPortfolio = async (name: string) => {
    if (!userId) return;
    const created = await createPortfolio(userId, name);
    await refresh();
    return created;
  };

  const addStock = async (ticker: string) => {
    if (!userId || !activePortfolioId) return;
    await addStockToPortfolio(userId, activePortfolioId, ticker);
    await refresh();
  };

  const removeStock = async (ticker: string) => {
    if (!userId || !activePortfolioId) return;
    await removeStockFromPortfolio(userId, activePortfolioId, ticker);
    await refresh();
  };

  return {
    portfolios,
    activePortfolio,
    activePortfolioId,
    activeStocks: activePortfolio?.stocks ?? [],
    loading,
    setActivePortfolioId,
    addPortfolio,
    addStock,
    removeStock,
    refresh,
  };
}
