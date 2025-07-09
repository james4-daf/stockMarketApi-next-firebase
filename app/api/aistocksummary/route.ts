import {
  FormattedRevenueData,
  RevenueDataItem,
  TableDataItem,
} from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { stockTicker } = await req.json();

    if (!stockTicker) {
      return NextResponse.json(
        { error: 'No stock ticker provided' },
        { status: 400 },
      );
    }

    // Fetch revenue data for the last 4 years
    const apiKey = process.env.NEXT_PUBLIC_STOCK_MARKET_API_KEY;
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/income-statement/${stockTicker}?period=annual&apikey=${apiKey}&limit=4`,
    );

    if (!response.ok) {
      throw new Error(`Error fetching revenue data: ${response.status}`);
    }

    const revenueData: RevenueDataItem[] = await response.json();

    if (!revenueData || revenueData.length === 0) {
      return NextResponse.json(
        { error: 'No revenue data found' },
        { status: 404 },
      );
    }

    // Format revenue data for analysis and table
    const formattedData: FormattedRevenueData[] = revenueData
      .map((item: RevenueDataItem) => ({
        year: new Date(item.date).getFullYear(),
        revenue: item.revenue,
        revenueInBillions: (item.revenue / 1e9).toFixed(3),
        date: item.date, // Keep original date for sorting
      }))
      .sort(
        (a: FormattedRevenueData, b: FormattedRevenueData) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      ); // Sort by date descending

    // Remove duplicates by year, keeping the most recent entry for each year
    const uniqueYearData: FormattedRevenueData[] = [];
    const seenYears = new Set<number>();

    formattedData.forEach((item: FormattedRevenueData) => {
      if (!seenYears.has(item.year)) {
        seenYears.add(item.year);
        uniqueYearData.push(item);
      }
    });

    // Sort by year ascending for YoY calculation
    const sortedData: FormattedRevenueData[] = uniqueYearData.sort(
      (a: FormattedRevenueData, b: FormattedRevenueData) => a.year - b.year,
    );

    // Calculate YoY growth
    const tableData: TableDataItem[] = sortedData
      .map((item: FormattedRevenueData, index: number) => {
        let yoyGrowth: string | null = null;
        if (index > 0) {
          const previousRevenue = sortedData[index - 1].revenue;
          const currentRevenue = item.revenue;
          const growthRate =
            ((currentRevenue - previousRevenue) / previousRevenue) * 100;
          yoyGrowth = `+${growthRate.toFixed(1)}%`;
        }

        return {
          year: item.year,
          revenue: item.revenueInBillions,
          yoyGrowth,
        };
      })
      .reverse(); // Show most recent year first

    // Simplified, faster prompt for GPT-3.5-turbo
    const revenueString = sortedData
      .map(
        (data: FormattedRevenueData) =>
          `${data.year}: $${data.revenueInBillions}B`,
      )
      .join(', ');

    const prompt = `Analyze ${stockTicker} revenue: ${revenueString}. Provide 5 sentences on growth trends, patterns, and trajectory.`;

    const openaiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Much faster than GPT-4
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 300, // Reduced for faster response
          temperature: 0.7,
        }),
      },
    );

    const data = await openaiResponse.json();
    const summary = data?.choices?.[0]?.message?.content || '';

    return NextResponse.json({ summary, tableData });
  } catch (err) {
    console.error('AI stock summary generation error:', err);
    return NextResponse.json(
      { error: 'Failed to generate AI summary' },
      { status: 500 },
    );
  }
}
