'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/components/ui/tabs';
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis } from 'recharts';

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
import { useEffect, useRef, useState } from 'react';
import BalanceSheetTable from './BalanceSheetTable';
import CashFlowTable from './CashFlowTable';

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
  epsdiluted: {
    label: 'Diluted EPS',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

type fundamentalDataTypes = {
  date: string;
  revenue: number;
  epsdiluted: number;
};

export function RevenueChart() {
  const { apiKey } = useStock();

  const params = useParams<{ stockTicker: string }>();
  const { stockTicker } = params;
  const [revenueData, setRevenueData] = useState();
  const fetched = useRef(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>('revenue');

  useEffect(() => {
    if (!stockTicker || fetched.current) return;
    fetched.current = true;

    const fetchStockData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/income-statement/${stockTicker}?period=annual&apikey=${apiKey}&limit=14`,
        );
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const json = await response.json();
        // console.log(json);
        const extractedData = json
          .map(({ date, revenue, epsdiluted }: fundamentalDataTypes) => ({
            date: new Date(date).getFullYear(), // Extract only the year
            revenue: revenue / 1e9, // Convert to billions
            epsdiluted,
          }))
          .sort(
            (a: fundamentalDataTypes, b: fundamentalDataTypes) =>
              Number(a.date) - Number(b.date),
          );

        setRevenueData(extractedData);
        // console.log("revData",extractedData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [stockTicker, activeChart, apiKey]);
  return (
    <Tabs
      onValueChange={() => setActiveChart('revenue')}
      defaultValue="Annual"
      className="w-full text-center"
    >
      <TabsList className="gap-2">
        <TabsTrigger value="Annual" className="hover:bg-brand">
          Income Statement
        </TabsTrigger>
        <TabsTrigger value="Balance Sheet" className="hover:bg-brand">
          Balance Sheet
        </TabsTrigger>
        <TabsTrigger value="Cash Flow" className="hover:bg-brand">
          Cash Flow
        </TabsTrigger>
      </TabsList>
      <TabsContent value="Annual">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        <Card>
          <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
              <CardTitle>{chartConfig[activeChart].label}</CardTitle>
            </div>
            <div className="flex">
              {['revenue', 'epsdiluted'].map((key) => {
                const chart = key as keyof typeof chartConfig;
                return (
                  <button
                    key={chart}
                    data-active={activeChart === chart}
                    className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6 hover:bg-brand"
                    onClick={() => setActiveChart(chart)}
                  >
                    <span className="text-xs text-muted-foreground">
                      {chartConfig[chart].label}
                    </span>
                    <span className="text-lg font-bold leading-none sm:text-3xl">
                      {/*{total[key as keyof typeof total].toLocaleString()}*/}
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
                data={revenueData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => value.toString()}
                />
                <Tooltip labelFormatter={(label: number) => `${label}`} />

                <Bar
                  dataKey={activeChart}
                  fill={`var(--color-${activeChart})`}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="Balance Sheet">
        <BalanceSheetTable />
      </TabsContent>
      <TabsContent value="Cash Flow">
        <CashFlowTable />
      </TabsContent>
    </Tabs>
  );
}
