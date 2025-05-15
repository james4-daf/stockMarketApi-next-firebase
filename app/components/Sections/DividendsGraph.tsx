'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/app/components/ui/chart';
import { useStock } from '@/app/hooks/useStock';
import { useParams } from 'next/navigation';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

const chartConfig = {
  dividends: {
    label: 'Dividends',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

type DividendsDataTypes = {
  date: string;
  dividend: number;
  year: number; // Added year for better chart labelss
};
export function DividendsGraph() {
  const { apiKey } = useStock();
  const params = useParams<{ stockTicker: string }>();
  const { stockTicker } = params;

  const [dividendsData, setDividendsData] = useState<DividendsDataTypes[]>([]);
  const fetched = useRef(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>('dividends');

  useEffect(() => {
    if (!stockTicker || fetched.current) return;
    fetched.current = true;

    const fetchDividendsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/${stockTicker}?from=2015-01-01&to=2025-10-10&apikey=${apiKey}`,
        );
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const json = await response.json();

        const extractedData = json.historical
          .map(({ date, dividend }: DividendsDataTypes) => ({
            date, // Keep the full date
            year: new Date(date).getFullYear(), // Extract year for better chart labels
            dividend,
          }))
          .sort(
            (a: DividendsDataTypes, b: DividendsDataTypes) =>
              new Date(a.date).getTime() - new Date(b.date).getTime(),
          ); // Sort oldest to newest

        setDividendsData(extractedData);
        // console.log("dividend",extractedData);
        // if(!extractedData) {
        //
        // }
        console.log('dividend', dividendsData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchDividendsData();
  }, [stockTicker, apiKey, dividendsData]);
  // Function to calculate the average percentage increase over n years
  const calculateAvgIncrease = (
    data: Array<{ year: number; dividend: number }>,
    years: number,
  ) => {
    if (data.length < years) return null;

    let totalPercentageIncrease = 0;
    let validYears = 0;

    for (let i = 1; i < years; i++) {
      const previousYear = data[i - 1];
      const currentYear = data[i];

      // Calculate percentage change year-over-year
      const percentageIncrease =
        ((currentYear.dividend - previousYear.dividend) /
          previousYear.dividend) *
        100;

      totalPercentageIncrease += percentageIncrease;
      validYears++;
    }

    // Return the average percentage increase
    return validYears > 0 ? totalPercentageIncrease / validYears : 0;
  };

  // Function to calculate total dividends for n years
  const calculateTotalPercentageGain = (
    data: Array<{ year: number; dividend: number }>,
    years: number,
  ) => {
    if (data.length < years) return null;

    const firstYearData = data[0];
    const lastYearData = data[years - 1];

    // Calculate total percentage gain from the first to the last year
    const percentageGain =
      ((lastYearData.dividend - firstYearData.dividend) /
        firstYearData.dividend) *
      100;

    return percentageGain;
  };

  // Compute averages for 3, 5, and 10 years
  const avgIncrease3y = calculateAvgIncrease(dividendsData, 3);
  const avgIncrease5y = calculateAvgIncrease(dividendsData, 5);
  const avgIncrease10y = calculateAvgIncrease(dividendsData, 10);

  const totalPercentageGain3y = calculateTotalPercentageGain(dividendsData, 3);
  const totalPercentageGain5y = calculateTotalPercentageGain(dividendsData, 5);
  const totalPercentageGain10y = calculateTotalPercentageGain(
    dividendsData,
    10,
  );

  return (
    dividendsData.length > 0 && (
      <>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        <Card>
          <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
              <CardTitle>{chartConfig[activeChart].label}</CardTitle>
            </div>
            <div className="flex">
              {['dividends'].map((key) => {
                const chart = key as keyof typeof chartConfig;
                return (
                  <button
                    key={chart}
                    data-active={activeChart === chart}
                    className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                    onClick={() => setActiveChart(chart)}
                  >
                    <span className="text-xs text-muted-foreground">
                      {chartConfig[chart].label}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={dividendsData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="year" // Use extracted year for better visualization
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      labelFormatter={(_, payload) => {
                        if (!payload || payload.length === 0) return '';
                        const { payload: data } = payload[0]; // Get data for hovered bar
                        return new Date(data.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        });
                      }}
                    />
                  }
                />
                <Bar dataKey="dividend" fill="#66d9c8" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <div className="px-6 py-4 flex">
          <div>
            <h2 className="text-lg font-semibold mb-2">
              Yearly Dividend Summary
            </h2>
            <ul className="space-y-1">
              {Object.entries(
                dividendsData.reduce((acc, { year, dividend }) => {
                  acc[year] = (acc[year] || 0) + dividend;
                  return acc;
                }, {} as Record<number, number>),
              )
                .sort(([a], [b]) => Number(b) - Number(a)) // Sort years descending
                .map(([year, total], index, arr) => {
                  // const prevYear = arr[index + 1]?.[0]; // Get previous year
                  const prevTotal = arr[index + 1]?.[1]; // Get previous year’s total

                  const hasFullYear =
                    dividendsData.filter((d) => d.year === Number(year))
                      .length === 4;
                  const percentageChange = prevTotal
                    ? ((total - prevTotal) / prevTotal) * 100
                    : null; // Calculate % change

                  return (
                    <li key={year} className="text-sm">
                      <strong>{year}:</strong> {total.toFixed(2)}
                      {!hasFullYear
                        ? ' (not full year)'
                        : prevTotal
                        ? ` (${percentageChange?.toFixed(1)}% ${
                            percentageChange !== null && percentageChange > 0
                              ? 'increase'
                              : 'decrease'
                          })`
                        : ''}
                    </li>
                  );
                })}
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold mt-4 mb-2">
              Dividend Increase Summary
            </h2>
            <ul className="space-y-1">
              {[
                { years: 3, avg: avgIncrease3y, total: totalPercentageGain3y },
                { years: 5, avg: avgIncrease5y, total: totalPercentageGain5y },
                {
                  years: 10,
                  avg: avgIncrease10y,
                  total: totalPercentageGain10y,
                },
              ].map(({ years, avg, total }) => (
                <li key={years} className="text-sm">
                  <strong>{years} years:</strong>
                  Avg Increase: {avg ? avg.toFixed(1) + '%' : 'N/A'}, Total
                  Gain: {total ? total.toFixed(2) + '%' : 'N/A'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </>
    )
  );
}
