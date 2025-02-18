'use client'
import { useStock } from "../hooks/useStock";
import { useParams } from 'next/navigation'
import {useEffect, useRef, useState} from "react";
import {SearchBar} from "@/app/components/SearchBar";
import Image from "next/image";
import Financials from "@/app/components/Sections/Financials";
import KeyFeatures from "@/app/components/KeyFeatures";
import Watchlist from "@/app/components/Sections/Watchlist";
export default function StockPage () {

    const {apiKey} = useStock();

    const params = useParams<{ stockTicker: string; }>()
    const {stockTicker} = params;
    const [inWatchlist, setInWatchlist] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [stockData, setStockData] = useState<{
        symbol: string;
        mktCap: number;
        price: number;
        image: string;
        companyName: string;
    } | null>(null);

    const fetched = useRef(false);

    useEffect(() => {
        if (!stockTicker || fetched.current) return;
        fetched.current = true;
        const fetchStock = async () => {
            try {

            setLoading(true);
            setError(null);
            const response = await fetch(`https://financialmodelingprep.com/api/v3/profile/${stockTicker}?apikey=${apiKey}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            const json = await response.json();
            const { symbol, mktCap, price,image,companyName } = json[0];
            setStockData({ symbol, mktCap, price,image,companyName });
            } catch (error) {
                setError(error instanceof Error ? error.message : "An error occurred.");
            } finally {
            setLoading(false);

            }


        }
        fetchStock()

    }, [stockTicker]);
    return (
        <div className=''>
        <div className="p-8 text-center">

    {
        loading && <p>Loading stock data...</p>
    }
    {
        error && <p className="text-red-500">Error: {error}</p>
    }
            {!loading && (<div className='flex'>
                <div className='flex justify-center items-center w-full'>
                    <div className='columns-2'>
                        <>
                            <Image
                                priority
                                src={`${stockData?.image}`}
                                width={150}
                                height={150}
                                alt={`Picture of ${stockTicker} logo`}
                            />
                            <p>Ticker: {stockData?.symbol}</p>
                        </>


                        <h2>{stockData?.companyName}</h2>


                        <p>Stock Price: ${stockData?.price}</p>
                        <p>Market Cap: {stockData?.mktCap}</p>

                            <button className='flex pe-1' onClick={() => {setInWatchlist(prev => !prev)}}>

                            <svg xmlns="http://www.w3.org/2000/svg" fill={inWatchlist ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
                            </svg>

                                {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                       </button>


                    </div>
                </div>


                <div className='justify-center items-center w-full'>

                    <KeyFeatures/>
                </div>
            </div>)}

        </div>

            <Financials/>
            <Watchlist />
        </div>
    )
}