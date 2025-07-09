import { useIsFreeStock } from '@/app/hooks/isFreeStock';
import { useStock } from '@/app/hooks/useStock';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CashFlowDataTypes } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

//endpoint
//https://financialmodelingprep.com/stable/balance-sheet-statement?symbol=AAPL&apikey=

const CashFlowTable = () => {
  const { apiKey } = useStock();
  const params = useParams<{ stockTicker: string }>();
  const isFree = useIsFreeStock();
  const { stockTicker } = params;
  const [cashFlowData, setCashFlowData] = useState<CashFlowDataTypes[]>();
  const [period, setPeriod] = useState<'annual' | 'quarter'>('annual');
  const fetched = useRef(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Format numbers to show billions with proper decimal places
  const formatBillions = (value: number): string => {
    if (value === 0) return '0.0B';
    if (value > 0) {
      return `$${value.toFixed(1)}B`;
    } else {
      return `-$${Math.abs(value).toFixed(1)}B`;
    }
  };

  useEffect(() => {
    if (!stockTicker || fetched.current) return;
    fetched.current = true;

    //financialmodelingprep.com/stable/cash-flow-statement?symbol=${stockTicker}&period=quarter&apikey=${apiKey}

    const fetchBalanceSheetStockData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/cash-flow-statement/${stockTicker}?period=${period}&apikey=${apiKey}&limit=8`,
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
              netIncome,
              stockBasedCompensation,
              freeCashFlow,
              period,
            }: CashFlowDataTypes) => ({
              date: new Date(date).getFullYear(), // Extract only the years
              fiscalYear,
              netIncome: netIncome / 1e9,
              stockBasedCompensation: stockBasedCompensation / 1e9,
              freeCashFlow: freeCashFlow / 1e9,
              period,
            }),
          )
          .sort(
            (a: CashFlowDataTypes, b: CashFlowDataTypes) =>
              Number(a.date) - Number(b.date),
          );

        setCashFlowData(extractedData);
        console.log('revData', extractedData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred.');
      } finally {
        // console.log('balanceSheetData', balanceSheetData);
        setLoading(false);
      }
    };

    fetchBalanceSheetStockData();
  }, [stockTicker, apiKey, period]);
  return (
    <div className="w-full sm:overflow-x-auto sm:max-w-full overflow-x-scroll">
      {error && <p className="text-red-500">Error: {error}</p>}

      {loading && (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      )}

      {!loading && isFree && (
        <Select
          onValueChange={(value) => setPeriod(value as 'annual' | 'quarter')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="annual">Annual</SelectItem>
            <SelectItem value="quarter">Quartely</SelectItem>
          </SelectContent>
        </Select>
      )}
      {!loading && cashFlowData && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold sticky left-0 z-10 bg-white">
                Metric
              </TableHead>
              {cashFlowData &&
                cashFlowData.map((item: CashFlowDataTypes) => (
                  <TableHead key={item.date} className="text-center font-bold">
                    {period === 'quarter'
                      ? `${item.fiscalYear} ${item.period}`
                      : item.date}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody className="content-start text-left">
            {[
              {
                label: 'Net Income',
                key: 'netIncome' as keyof CashFlowDataTypes,
              },
              {
                label: 'Stock Based Compensation',
                key: 'stockBasedCompensation' as keyof CashFlowDataTypes,
              },
              {
                label: 'Free Cash Flow',
                key: 'freeCashFlow' as keyof CashFlowDataTypes,
              },
            ].map(({ label, key }) => (
              <TableRow key={key}>
                <TableCell className="font-bold sticky left-0 z-10 bg-white">
                  {label}
                </TableCell>
                {cashFlowData &&
                  cashFlowData.map((item: CashFlowDataTypes) => (
                    <TableCell
                      key={`${item.date}-${key}`}
                      className="text-center"
                    >
                      {formatBillions(item[key] as number)}
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

export default CashFlowTable;
