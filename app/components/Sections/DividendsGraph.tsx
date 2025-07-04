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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/components/ui/tabs';
import { useStock } from '@/app/hooks/useStock';
import { useParams } from 'next/navigation';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Separator } from '../ui/separator';

const chartConfig = {
  dividends: {
    label: 'Dividends',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

type DividendsDataTypes = {
  date: string;
  adjDividend: number;
  year: number; // Added year for better chart labelss
};
export function DividendsGraph() {
  const { apiKey } = useStock();
  const params = useParams<{ stockTicker: string }>();
  const { stockTicker } = params;
  const [quarterlyData, setQuarterlyData] = useState<DividendsDataTypes[]>([]);
  const [yearlyData, setYearlyData] = useState<
    { year: number; dividend: number }[]
  >([]);
  const fetched = useRef(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<'quarterly' | 'yearly'>(
    'quarterly',
  );

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

        // Quarterly: as-is
        const quarterly = json.historical.map((item: DividendsDataTypes) => ({
          date: item.date,
          dividend: item.adjDividend,
          year: new Date(item.date).getFullYear(),
        }));

        // Yearly: group and sum
        const yearlyMap: Record<number, number> = {};
        quarterly.forEach(
          ({ year, dividend }: { year: number; dividend: number }) => {
            yearlyMap[year] = (yearlyMap[year] || 0) + dividend;
          },
        );
        const yearly = Object.entries(yearlyMap)
          .map(([year, dividend]) => ({ year: Number(year), dividend }))
          .sort((a, b) => a.year - b.year);

        setQuarterlyData(quarterly.reverse()); // reverse for chronological order
        setYearlyData(yearly);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchDividendsData();
  }, [stockTicker, apiKey]);

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
  const avgIncrease3y = calculateAvgIncrease(yearlyData, 3);
  const avgIncrease5y = calculateAvgIncrease(yearlyData, 5);
  const avgIncrease10y = calculateAvgIncrease(yearlyData, 10);

  const totalPercentageGain3y = calculateTotalPercentageGain(yearlyData, 3);
  const totalPercentageGain5y = calculateTotalPercentageGain(yearlyData, 5);
  const totalPercentageGain10y = calculateTotalPercentageGain(yearlyData, 10);

  return (
    setQuarterlyData.length > 0 && (
      <>
        <Separator className="my-8" />
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <Card className="flex-1">
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
              <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                <CardTitle>Dividends</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
              <Tabs
                value={activeChart}
                onValueChange={(val) =>
                  setActiveChart(val as 'quarterly' | 'yearly')
                }
                className="w-full"
              >
                <TabsList className="gap-2">
                  <TabsTrigger value="quarterly" className="hover:bg-brand">
                    Quarterly
                  </TabsTrigger>
                  <TabsTrigger value="yearly" className="hover:bg-brand">
                    Yearly
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="quarterly">
                  <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                  >
                    <BarChart
                      accessibilityLayer
                      data={quarterlyData}
                      margin={{ left: 12, right: 12 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
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
                              const { payload: data } = payload[0];
                              return new Date(data.date).toLocaleDateString(
                                'en-US',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                },
                              );
                            }}
                          />
                        }
                      />
                      <Bar dataKey="dividend" fill="#66d9c8" />
                    </BarChart>
                  </ChartContainer>
                </TabsContent>
                <TabsContent value="yearly">
                  <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                  >
                    <BarChart
                      accessibilityLayer
                      data={yearlyData}
                      margin={{ left: 12, right: 12 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="year"
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
                              const { payload: data } = payload[0];
                              return data.year;
                            }}
                          />
                        }
                      />
                      <Bar dataKey="dividend" fill="#66d9c8" />
                    </BarChart>
                  </ChartContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <div className="px-6 py-4 bg-white rounded-xl shadow-sm border border-gray-200 flex-1 lg:max-w-md">
            <h2 className="text-lg font-semibold mb-2">
              Yearly Dividend Summary
            </h2>
            <div className="overflow-x-auto w-full">
              <table className="table-auto border-collapse  text-sm">
                <thead>
                  <tr>
                    {Object.keys(
                      yearlyData.reduce((acc, { year }) => {
                        acc[year] = true;
                        return acc;
                      }, {} as Record<number, boolean>),
                    )
                      .sort((a, b) => Number(a) - Number(b))
                      .map((year) => (
                        <th
                          key={year}
                          className="px-4 py-2 border-b font-semibold text-left whitespace-nowrap"
                        >
                          {year}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {Object.entries(
                      yearlyData.reduce((acc, { year, dividend }) => {
                        acc[year] = (acc[year] || 0) + dividend;
                        return acc;
                      }, {} as Record<number, number>),
                    )
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([year, total]) => (
                        <td
                          key={year}
                          className="px-4 py-2 border-b whitespace-nowrap"
                        >
                          {total.toFixed(2)}
                        </td>
                      ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">
                Dividend Increase Summary
              </h2>
              <ul className="space-y-1">
                {[
                  {
                    years: 3,
                    avg: avgIncrease3y,
                    total: totalPercentageGain3y,
                  },
                  {
                    years: 5,
                    avg: avgIncrease5y,
                    total: totalPercentageGain5y,
                  },
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
        </div>
      </>
    )
  );
}
