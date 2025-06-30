import { useStock } from '@/app/hooks/useStock';
import { ExternalLink, FileText } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

type Report = {
  date: string;
  url: string;
  form: string;
  accessionNumber: string;
  primaryDocument: string;
};

export default function CompanyReports() {
  const { apiKey } = useStock();
  const params = useParams<{ stockTicker: string }>();
  const { stockTicker } = params; // Get stock ticker from URL
  const [tenKReports, setTenKReports] = useState<Report[]>([]);
  const [tenQReports, setTenQReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultYear, setDefaultYear] = useState<string | null>(null);

  useEffect(() => {
    if (!stockTicker) return;

    const fetchReports = async () => {
      try {
        setLoading(true);

        // Step 1: Get CIK from Financial Modeling Prep
        const profileRes = await fetch(
          `https://financialmodelingprep.com/api/v3/profile/${stockTicker}?apikey=${apiKey}`,
        );
        const profileData = await profileRes.json();

        if (!profileData.length) {
          console.error('Company not found.');
          return; // Avoid throwing an error
        }
        const cik = profileData[0].cik;

        // Step 2: Get 10-Q and 10-K reports from SEC
        const secRes = await fetch(
          `https://data.sec.gov/submissions/CIK${cik}.json`,
        );
        const secData = await secRes.json();

        // Step 3: Extract 10-Q and 10-K filings
        const filings = secData.filings.recent;

        const tenQReports = filings.form
          .map((form: string, index: number) => ({
            form,
            date: filings.filingDate[index],
            accessionNumber: filings.accessionNumber[index],
            primaryDocument: filings.primaryDocument[index],
          }))
          .filter((report: Report) => report.form === '10-Q')
          .map((report: Report) => ({
            date: report.date,
            url: `https://www.sec.gov/Archives/edgar/data/${cik}/${report.accessionNumber.replace(
              /-/g,
              '',
            )}/${report.primaryDocument}`,
          }));

        const tenKReports: Report[] = filings.form
          .map((form: string, index: number) => ({
            form,
            date: filings.filingDate[index],
            accessionNumber: filings.accessionNumber[index],
            primaryDocument: filings.primaryDocument[index],
          }))
          .filter((report: Report) => report.form === '10-K')
          .map((report: Report) => ({
            date: report.date,
            url: `https://www.sec.gov/Archives/edgar/data/${cik}/${report.accessionNumber.replace(
              /-/g,
              '',
            )}/${report.primaryDocument}`,
          }));

        setTenKReports(tenKReports);
        setTenQReports(tenQReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [stockTicker, apiKey]);

  const groupByYear = (reports: Report[]) => {
    return reports.reduce((acc: { [year: number]: Report[] }, report) => {
      const year = new Date(report.date).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(report);
      return acc;
    }, {});
  };

  const groupedTenQReports: { [year: string]: Report[] } =
    groupByYear(tenQReports);
  const groupedTenKReports: { [year: string]: Report[] } =
    groupByYear(tenKReports);

  const groupedReports = Object.keys(groupedTenQReports).reduce(
    (acc: { [year: string]: { tenQ: Report[]; tenK: Report[] } }, year) => {
      acc[year] = {
        tenQ: groupedTenQReports[year],
        tenK: groupedTenKReports[year] || [],
      };
      return acc;
    },
    {},
  );

  useEffect(() => {
    if (Object.keys(groupedReports).length > 0) {
      setLoading(true);
      setDefaultYear(
        Object.keys(groupedReports).sort((a, b) => b.localeCompare(a))[0],
      );
    }
    setLoading(false);
  }, [groupedReports]);

  if (loading) return <p>Loading...</p>;
  if (!defaultYear) return null;
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 mt-4">
      <h1 className="text-xl font-bold mb-4">{stockTicker} Reports</h1>

      <Tabs
        defaultValue={defaultYear}
        className="w-full sm:overflow-x-auto sm:max-w-full overflow-x-scroll max-w-[400px] min-w-[380px]"
      >
        <TabsList className="gap-2">
          {Object.keys(groupedReports)
            .sort((a, b) => b.localeCompare(a))
            .map((year) => (
              <TabsTrigger key={year} value={year} className="hover:bg-brand">
                {year}
              </TabsTrigger>
            ))}
        </TabsList>

        {Object.keys(groupedReports).map((year) => (
          <TabsContent key={year} value={year}>
            <div>
              {groupedReports[year].tenQ.length > 0 && (
                <div>
                  <h4 className="font-medium">Quartely Reports</h4>
                  <ul>
                    {groupedReports[year].tenQ.map((report, index) => (
                      <li key={index} className="mb-2">
                        <a
                          href={report.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <FileText color="#1bafee" />
                          <span>{report.date} - 10-Q</span>
                          <ExternalLink size={18} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {groupedReports[year].tenK.length > 0 && (
                <div>
                  <h4 className="font-medium">Annual Report</h4>
                  <ul>
                    {groupedReports[year].tenK.map((report, index) => (
                      <li key={index}>
                        <a
                          href={report.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex text-blue-500 gap-2 items-center"
                        >
                          {report.date} - 10-K Report
                          <ExternalLink size={18} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
