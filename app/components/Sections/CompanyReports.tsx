import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import { useStock } from "@/app/hooks/useStock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {FileText} from "lucide-react";


type Report = {
    date: string;
    url: string;
    form: string
    accessionNumber: string;
    primaryDocument: string;
};

type GroupedReports = {
    [year: string]: {
        tenQ: Report[];
        tenK: Report[];
    };
};

export default function CompanyReports() {
    const { apiKey } = useStock();
    const params = useParams<{ stockTicker: string; }>();
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
                    `https://financialmodelingprep.com/api/v3/profile/${stockTicker}?apikey=${apiKey}`
                );
                const profileData = await profileRes.json();

                // if (!profileData.length) throw new Error("Company not found.");
                if (!profileData.length) {
                    console.error("Company not found.");
                    return; // Avoid throwing an error
                }
                const cik = profileData[0].cik;
                console.log(cik);

                // Step 2: Get 10-Q and 10-K reports from SEC
                const secRes = await fetch(`https://data.sec.gov/submissions/CIK${cik}.json`);
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
                    .filter((report: Report) => report.form === "10-Q")
                    .map((report:Report) => ({
                        date: report.date,
                        url: `https://www.sec.gov/Archives/edgar/data/${cik}/${report.accessionNumber.replace(
                            /-/g,
                            ""
                        )}/${report.primaryDocument}`,
                    }));

                const tenKReports:Report[] = filings.form
                    .map((form: string, index: number) => ({
                        form,
                        date: filings.filingDate[index],
                        accessionNumber: filings.accessionNumber[index],
                        primaryDocument: filings.primaryDocument[index],
                    }))
                    .filter((report: Report) => report.form === "10-K")
                    .map((report: Report) => ({
                        date: report.date,
                        url: `https://www.sec.gov/Archives/edgar/data/${cik}/${report.accessionNumber.replace(
                            /-/g,
                            ""
                        )}/${report.primaryDocument}`,
                    }));

                setTenKReports(tenKReports);
                setTenQReports(tenQReports);
            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [stockTicker, apiKey]);

    // Helper function to group reports by year
    const groupByYear = (reports: any[]) => {
        return reports.reduce((acc, report) => {
            const year = new Date(report.date).getFullYear();
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(report);
            return acc;
        }, {});
    };

    // Group reports by year
    const groupedTenQReports = groupByYear(tenQReports);
    const groupedTenKReports = groupByYear(tenKReports);

    // Combine both reports in each year
    const groupedReports = Object.keys(groupedTenQReports).reduce((acc, year) => {
        acc[year] = {
            tenQ: groupedTenQReports[year],
            tenK: groupedTenKReports[year] || [],
        };
        return acc;
    }, {});


    // Set the most recent year as the default value
    useEffect(() => {
        if (Object.keys(groupedReports).length > 0) {
            setLoading(true);
            setDefaultYear(Object.keys(groupedReports).sort((a, b) => b.localeCompare(a))[0]);
        }
        setLoading(false);
    }, [groupedReports]);

    if (loading) return <p>Loading...</p>;
    if (!defaultYear) return null;
    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">{stockTicker} Reports</h1>




            <Tabs defaultValue={defaultYear} className="w-[400px]">
                <TabsList>
                    {Object.keys(groupedReports).sort((a, b) => b.localeCompare(a)).map((year) => (
                        <TabsTrigger key={year} value={year}>
                            {year}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {Object.keys(groupedReports).map((year) => (
                    <TabsContent key={year} value={year}>

                        <div>
                            {/* 10-Q Reports for this year */}
                            {groupedReports[year].tenQ.length > 0 && (
                                <div>
                                    <h4 className="font-medium">Quartely Reports</h4>
                                    <ul>
                                        {groupedReports[year].tenQ.map((report, index) => (
                                            <li key={index}>
                                                <a href={report.url} target="_blank" rel="noopener noreferrer" className="flex">


                                                    <FileText color='#1bafee'/>
                                                        <span>{report.date} - 10-Q </span>

                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {/* 10-K Reports for this year */}
                            {groupedReports[year].tenK.length > 0 && (
                                <div>
                                    <h4 className="font-medium">Annual Report</h4>
                                    <ul>
                                        {groupedReports[year].tenK.map((report, index) => (
                                            <li key={index}>
                                                <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                                    {report.date} - 10-K Report
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