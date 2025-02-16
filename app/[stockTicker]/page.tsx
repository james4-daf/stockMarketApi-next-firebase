'use client'
import { useStock } from "../hooks/useStock";
import { useParams } from 'next/navigation'
import {useEffect, useRef, useState} from "react";
import {SearchBar} from "@/app/components/SearchBar";
import Image from "next/image";
import Financials from "@/app/components/Sections/Financials";
import KeyFeatures from "@/app/components/KeyFeatures";
export default function StockPage () {

    const {apiKey} = useStock();

    const params = useParams<{ stockTicker: string; }>()
    const {stockTicker} = params;
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
        <div className='justify-center text-center p-8'>
            <SearchBar />
        <div
        className="p-8 text-center">

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
                </div>
                    </div>


            <div className='justify-center items-center w-full'>

                  <KeyFeatures />
            </div>
        </div>)}

        </div>

            <Financials />
        </div>
)
}