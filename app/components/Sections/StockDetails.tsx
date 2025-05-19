import { useKeyFeatures } from '@/app/hooks/useKeyFeatures';
import { Star } from 'lucide-react';
import { useParams } from 'next/navigation';
import React from 'react';
interface StockProps {
  symbol: string;
  mktCap: number;
  price: number;
  image: string;
  companyName: string;
}

interface StockDetailsProps {
  stockData: StockProps;
  inWatchlist: boolean;
  toggleWatchlist: () => void;
}
export const StockDetails = ({
  stockData,
  inWatchlist,
  toggleWatchlist,
}: StockDetailsProps) => {
  const params = useParams<{ stockTicker: string }>();
  const { stockTicker } = params;
  const { keyFeaturesData } = useKeyFeatures(stockTicker);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-16 h-16 mr-4 flex-shrink-0">
            <img
              src={stockData?.image}
              alt={stockData?.symbol}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{stockData?.companyName}</h2>
            <p className="text-gray-600">Ticker: {stockData?.symbol}</p>
          </div>
        </div>
        <div className="flex flex-col md:items-end">
          <div className="flex items-center mb-2">
            <h3 className="text-2xl font-bold">${stockData?.price}</h3>
            <button className="ml-2 text-yellow-500" onClick={toggleWatchlist}>
              <Star
                className={`w-5 h-5 ${inWatchlist ? 'fill-yellow-500' : ''}`}
              />
            </button>
          </div>
          <p className="text-gray-600">
            Market Cap: $
            {stockData?.mktCap >= 1e12
              ? `${(stockData.mktCap / 1e12).toFixed(1)}T`
              : `${(stockData.mktCap / 1e9).toFixed(2)}B`}
          </p>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-3">Key Features</h3>
        <div className="grid grid-cols-2 gap-4">
          {keyFeaturesData && (
            <>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-sm">TTM P/E</p>
                <p>{Math.round(keyFeaturesData.peRatioTTM * 100) / 100}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-sm">Div Yield</p>
                <p>
                  {Math.round(keyFeaturesData.dividendYielPercentageTTM * 100) /
                    100}
                  %
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
