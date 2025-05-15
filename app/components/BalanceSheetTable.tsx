import { useStock } from '@/app/hooks/useStock';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface BalanceSheetDataTypes {
  date: string;
  fiscalYear: string;
  cashAndCashEquivalents: number;
  totalEquity: number;
  totalDebt: number;
  netDebt: number;
}

//endpoint
//https://financialmodelingprep.com/stable/balance-sheet-statement?symbol=AAPL&apikey=

const BalanceSheetTable = () => {
  const { apiKey } = useStock();

  const params = useParams<{ stockTicker: string }>();
  const { stockTicker } = params;
  const [balanceSheetData, setBalanceSheetData] =
    useState<BalanceSheetDataTypes[]>();
  const fetched = useRef(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stockTicker || fetched.current) return;
    fetched.current = true;

    const fetchBalanceSheetStockData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${stockTicker}?period=annual&apikey=${apiKey}`,
        );
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const json = await response.json();
        // console.log(json);
        const extractedData = json
          .map(
            ({
              date,
              fiscalYear,
              cashAndCashEquivalents,
              totalEquity,
              totalDebt,
              netDebt,
            }: BalanceSheetDataTypes) => ({
              date: new Date(date).getFullYear(), // Extract only the years
              fiscalYear,
              cashAndCashEquivalents: cashAndCashEquivalents / 1e9,
              totalEquity: totalEquity / 1e9,
              totalDebt: totalDebt / 1e9,
              netDebt: netDebt / 1e9,
            }),
          )
          .sort(
            (a: BalanceSheetDataTypes, b: BalanceSheetDataTypes) =>
              Number(a.date) - Number(b.date),
          );

        setBalanceSheetData(extractedData);
        console.log('revData', extractedData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred.');
      } finally {
        // console.log('balanceSheetData', balanceSheetData);
        setLoading(false);
      }
    };

    fetchBalanceSheetStockData();
  }, [stockTicker, apiKey]);
  return (
    <div className="w-full sm:overflow-x-auto sm:max-w-full overflow-x-scroll max-w-[330px]">
      {error && <p className="text-red-500">Error: {error}</p>}

      {loading && (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      )}
      {!loading && balanceSheetData && (
        <Table className="min-w-[400px]">
          <TableCaption>Balance Sheet Overview</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Metric</TableHead>
              {balanceSheetData &&
                balanceSheetData.map((item: BalanceSheetDataTypes) => (
                  <TableHead key={item.date} className="text-center font-bold">
                    {item.date}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody className="content-start">
            {[
              {
                label: 'Cash And Cash Equivalents',
                key: 'cashAndCashEquivalents' as keyof BalanceSheetDataTypes,
              },
              {
                label: 'Total Equity',
                key: 'totalEquity' as keyof BalanceSheetDataTypes,
              },
              {
                label: 'Total Debt',
                key: 'totalDebt' as keyof BalanceSheetDataTypes,
              },
              {
                label: 'Net Debt',
                key: 'netDebt' as keyof BalanceSheetDataTypes,
              },
            ].map(({ label, key }) => (
              <TableRow key={key}>
                <TableCell className="font-bold">{label}</TableCell>
                {balanceSheetData &&
                  balanceSheetData.map((item: BalanceSheetDataTypes) => (
                    <TableCell
                      key={`${item.date}-${key}`}
                      className="text-center"
                    >
                      {item[key]}
                    </TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default BalanceSheetTable;
