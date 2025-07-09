'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AiSummaryModalProps, TableDataItem } from '@/lib/types';
import { Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

export function AiSummaryModal({
  isOpen,
  onClose,
  stockTicker,
}: AiSummaryModalProps) {
  const [tableLoading, setTableLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [tableData, setTableData] = useState<TableDataItem[]>([]);
  const [error, setError] = useState<string>('');

  const generateTableAndSummary = async () => {
    setTableLoading(true);
    setError('');
    setSummary('');
    setTableData([]);

    try {
      const response = await fetch('/api/aistocksummary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stockTicker }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      // Show table immediately
      setTableData(data.tableData || []);
      setTableLoading(false);

      // Start AI loading state
      setAiLoading(true);

      // Set summary (AI analysis comes with the same response but we simulate delay)
      setTimeout(() => {
        setSummary(data.summary);
        setAiLoading(false);
      }, 100); // Small delay to show the streaming effect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTableLoading(false);
      setAiLoading(false);
    }
  };

  // Trigger generation when modal opens
  useEffect(() => {
    if (isOpen) {
      generateTableAndSummary();
    }
  }, [isOpen, stockTicker]);

  const handleClose = () => {
    onClose();
    setSummary('');
    setTableData([]);
    setError('');
    setTableLoading(false);
    setAiLoading(false);
  };

  const handleRetry = () => {
    generateTableAndSummary();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Summary - {stockTicker.toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 overflow-y-auto">
          {/* Initial Loading State */}
          {tableLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-sm text-gray-600">Loading revenue data...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Table and AI Analysis */}
          {tableData.length > 0 && !tableLoading && (
            <div className="space-y-6">
              {/* Revenue Table - Shows Immediately */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Revenue Growth Overview
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Year</TableHead>
                        <TableHead className="font-semibold">
                          Revenue (USD B)
                        </TableHead>
                        <TableHead className="font-semibold">
                          YoY Growth
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.map((row) => (
                        <TableRow key={row.year}>
                          <TableCell className="font-medium">
                            {row.year}
                          </TableCell>
                          <TableCell>{row.revenue}</TableCell>
                          <TableCell
                            className={
                              row.yoyGrowth
                                ? row.yoyGrowth.startsWith('+')
                                  ? 'text-green-600 font-medium'
                                  : 'text-red-600 font-medium'
                                : 'text-gray-400'
                            }
                          >
                            {row.yoyGrowth || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* AI Analysis Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  AI Analysis
                </h3>

                {aiLoading && (
                  <div className="flex items-center gap-2 py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <p className="text-sm text-blue-600">
                      Generating AI insights...
                    </p>
                  </div>
                )}

                {summary && !aiLoading && (
                  <div className="text-blue-800 text-sm leading-relaxed whitespace-pre-line">
                    {summary}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
