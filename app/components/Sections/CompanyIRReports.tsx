'use client';

import { IRReportSummaryModal } from '@/app/components/IRReportSummaryModal';
import { IRCrawlResult, IRReport } from '@/lib/types';
import {
  ExternalLink,
  FileText,
  Loader2,
  Search,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface CompanyIRReportsProps {
  website: string;
  ticker: string;
}

export default function CompanyIRReports({
  website,
  ticker,
}: CompanyIRReportsProps) {
  const [reports, setReports] = useState<IRReport[]>([]);
  const [irPageUrl, setIrPageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [manualUrl, setManualUrl] = useState('');
  const [summaryReport, setSummaryReport] = useState<IRReport | null>(null);
  const [summaryFile, setSummaryFile] = useState<File | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchIRReports = async (irPageUrl?: string) => {
    setLoading(true);
    setError('');
    setReports([]);

    try {
      const response = await fetch('/api/crawl-ir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          ticker,
          ...(irPageUrl && { irPageUrl }),
        }),
      });

      const data: IRCrawlResult = await response.json();

      if (data.error && data.reports.length === 0) {
        setError(data.error);
      } else {
        setReports(data.reports);
        setIrPageUrl(data.irPageUrl);
      }
    } catch {
      setError('Failed to fetch investor relations reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (website) {
      fetchIRReports();
    }
  }, [website, ticker]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      fetchIRReports(manualUrl.trim());
    }
  };

  const handleSummaryClick = (report: IRReport) => {
    setSummaryReport(report);
    setSummaryFile(null);
    setIsSummaryOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSummaryFile(file);
      setSummaryReport(null);
      setIsSummaryOpen(true);
    }
    // Reset input so same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSummaryClose = () => {
    setIsSummaryOpen(false);
    setSummaryReport(null);
    setSummaryFile(null);
  };

  // Group reports by year
  const groupedByYear = reports.reduce<Record<number, IRReport[]>>(
    (acc, report) => {
      const year = report.year || 0;
      if (!acc[year]) acc[year] = [];
      acc[year].push(report);
      return acc;
    },
    {},
  );

  const sortedYears = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);
  const defaultYear = sortedYears[0]?.toString();

  const typeBadge = (type: IRReport['type']) => {
    const styles = {
      annual: 'bg-green-100 text-green-700',
      quarterly: 'bg-blue-100 text-blue-700',
      other: 'bg-gray-100 text-gray-700',
    };
    const labels = {
      annual: 'Annual',
      quarterly: 'Quarterly',
      other: 'Report',
    };
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[type]}`}
      >
        {labels[type]}
      </span>
    );
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Company Reports</h1>
        <div className="flex items-center gap-3">
          {/* PDF Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 transition-colors"
            title="Upload a PDF for AI analysis"
          >
            <Upload size={14} />
            Upload PDF
          </button>
          {irPageUrl && (
            <a
              href={irPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-1"
            >
              IR Page <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 py-6 justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">
            Searching for investor relations reports...
          </p>
        </div>
      )}

      {/* Error / No reports + manual URL input */}
      {!loading && (error || reports.length === 0) && (
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-3">
            {error || 'No investor relations reports found.'}
          </p>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="Paste investor relations page URL..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button type="submit" size="sm" disabled={!manualUrl.trim()}>
              Search
            </Button>
          </form>
          <p className="text-xs text-gray-400 mt-2">
            Or upload a PDF directly using the button above for AI analysis
          </p>
        </div>
      )}

      {/* Reports list */}
      {!loading && reports.length > 0 && defaultYear && (
        <Tabs defaultValue={defaultYear} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="gap-2 flex-nowrap min-w-max pl-2">
              {sortedYears.map((year) => (
                <TabsTrigger
                  key={year}
                  value={year.toString()}
                  className="hover:bg-brand"
                >
                  {year === 0 ? 'Unknown' : year}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {sortedYears.map((year) => (
            <TabsContent key={year} value={year.toString()}>
              <ul className="space-y-2">
                {groupedByYear[year].map((report, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 py-1.5 group"
                  >
                    <FileText className="text-blue-400 shrink-0" size={18} />
                    <span className="text-sm text-gray-700 truncate flex-1">
                      {report.title}
                    </span>
                    {typeBadge(report.type)}
                    {report.quarter && (
                      <span className="text-xs text-gray-400">
                        Q{report.quarter}
                      </span>
                    )}
                    <a
                      href={report.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                      title="Open PDF"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => handleSummaryClick(report)}
                      className="text-purple-400 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="AI Summary"
                    >
                      <Sparkles size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* AI Summary Modal */}
      <IRReportSummaryModal
        isOpen={isSummaryOpen}
        onClose={handleSummaryClose}
        report={summaryReport}
        file={summaryFile}
        ticker={ticker}
      />
    </div>
  );
}
