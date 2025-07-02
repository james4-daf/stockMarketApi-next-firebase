import { useKeyFeatures } from '@/app/hooks/useKeyFeatures';
import { Star } from 'lucide-react';
import { useParams } from 'next/navigation';
import React from 'react';
interface StockProps {
  symbol: string;
  marketCap: number;
  price: number;
  image: string;
  companyName: string;
  range: string;
  change: number;
  changePercentage: number;
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md ">
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
            <div className="flex gap-2">
              <p className="text-gray-600">Ticker: {stockData?.symbol}</p>
              <button
                className="ml-2 text-yellow-500"
                onClick={toggleWatchlist}
              >
                <Star
                  className={`w-5 h-5 ${inWatchlist ? 'fill-yellow-500' : ''}`}
                />
              </button>
            </div>
            <p className="text-gray-600">
              Market Cap: $
              {stockData?.marketCap >= 1e12
                ? `${(stockData.marketCap / 1e12).toFixed(1)}T`
                : `${(stockData.marketCap / 1e9).toFixed(1)}B`}
            </p>
          </div>
        </div>
        <div className="flex flex-col md:items-end">
          <div className=" items-center mb-2 ">
            <h3 className="text-2xl font-bold">
              ${stockData?.price.toFixed(2)}
            </h3>
          </div>
          <div
            className={`flex gap-2 ${
              stockData?.changePercentage >= 0
                ? 'text-green-600'
                : 'text-red-500'
            }`}
          >
            <p>${stockData?.change}</p>
            <p>
              ({stockData?.changePercentage >= 0 ? '+' : ''}
              {(stockData?.changePercentage).toFixed(1)}%)
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-3">Key Features</h3>
        <div className="grid grid-cols-2 gap-4">
          {keyFeaturesData && (
            <>
              <div className="bg-gray-50 p-3 border border-transparent rounded-lg shadow-md hover:shadow-xl hover:border-2 hover:border-brand transition-all  duration-300 hover:bg-gray-100">
                <p className="text-gray-500 text-sm">TTM P/E</p>
                <p>{Math.round(keyFeaturesData.peRatioTTM * 100) / 100} </p>
              </div>
              {keyFeaturesData.freeCashFlowYieldTTM > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg shadow-md hover:shadow-xl transition-all  duration-300 hover:bg-gray-100 hover:border-2 hover:border-brand">
                  <p className="text-gray-500 text-sm">
                    TTM Free Cash Flow Yield
                  </p>
                  <p>
                    {(keyFeaturesData.freeCashFlowYieldTTM * 100).toFixed(2)} %
                  </p>
                </div>
              )}
              <div className="bg-gray-50 p-3 rounded-lg shadow-md hover:shadow-xl transition-all  duration-300 hover:bg-gray-100 hover:border-2 hover:border-brand">
                <p className="text-gray-500 text-sm">52 Week Range</p>
                <p>
                  {stockData?.range.split('-')[0]} -{' '}
                  {stockData?.range.split('-')[1]}
                </p>
              </div>

              {keyFeaturesData.dividendYieldPercentageTTM > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg shadow-md hover:shadow-xl transition-all  duration-300 hover:bg-gray-100 hover:border-2 hover:border-brand">
                  <p className="text-gray-500 text-sm">Div Yield</p>
                  <p>
                    {Math.round(
                      keyFeaturesData.dividendYieldPercentageTTM * 100,
                    ) / 100}{' '}
                    %
                  </p>
                </div>
              )}
              {keyFeaturesData.payoutRatioTTM > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg shadow-md hover:shadow-xl transition-all  duration-300 hover:bg-gray-100 hover:border-2 hover:border-brand">
                  <p className="text-gray-500 text-sm">Payout Ratio</p>
                  <p>{Math.round(keyFeaturesData.payoutRatioTTM * 100)}%</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
