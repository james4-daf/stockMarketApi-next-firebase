'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IRReport } from '@/lib/types';
import { ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

interface IRReportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: IRReport | null;
  file: File | null;
  ticker: string;
}

export function IRReportSummaryModal({
  isOpen,
  onClose,
  report,
  file,
  ticker,
}: IRReportSummaryModalProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchSummary = async () => {
    if (!report && !file) return;

    setLoading(true);
    setError('');
    setSummary('');

    try {
      let response: Response;

      if (file) {
        // File upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('ticker', ticker);
        response = await fetch('/api/pdf-summary', {
          method: 'POST',
          body: formData,
        });
      } else {
        // URL-based
        response = await fetch('/api/pdf-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfUrl: report!.url,
            ticker,
            reportType: report!.type,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && (report || file)) {
      fetchSummary();
    }
  }, [isOpen, report?.url, file]);

  const handleClose = () => {
    onClose();
    setSummary('');
    setError('');
    setLoading(false);
  };

  const title = file ? file.name : report?.title;
  const year = report?.year;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Report Summary
          </DialogTitle>
        </DialogHeader>

        {title && (
          <p className="text-sm text-gray-500 mt-1">
            {title}
            {year && ` (${year})`}
          </p>
        )}

        <div className="mt-4">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-sm text-gray-600">
                Extracting and summarizing PDF...
              </p>
              <p className="text-xs text-gray-400 mt-1">
                This may take a moment for large reports
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSummary}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Summary */}
          {summary && !loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Key Takeaways</h3>
              <div className="text-blue-800 text-sm leading-relaxed whitespace-pre-line">
                {summary}
              </div>
            </div>
          )}

          {/* Open PDF link */}
          {report && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <a
                href={report.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
              >
                <ExternalLink size={14} />
                Open full PDF in new tab
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
