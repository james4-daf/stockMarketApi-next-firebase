"use client"
import {useEffect, useRef, useState} from "react";
import {useStock} from "@/app/hooks/useStock";
import {useParams} from "next/navigation";

export default function KeyFeatures() {
    const {apiKey} = useStock();
    const params = useParams<{ stockTicker: string; }>()
    const {stockTicker} = params;
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [keyFeaturesData, setKeyFeaturesData] = useState<{
        peRatioTTM: number;
        dividendYielPercentageTTM: number;

    } | null>(null);

    const fetched = useRef(false);


    useEffect(() => {
        if (!stockTicker || fetched.current) return;
        fetched.current = true;

        const fetchKeyFeatureStockData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(
                    `https://financialmodelingprep.com/api/v3/ratios-ttm/${stockTicker}?}&apikey=${apiKey}`
                );
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                const json = await response.json();
                // console.log(json);
                const { peRatioTTM,dividendYielPercentageTTM } = json[0];
                setKeyFeaturesData({ peRatioTTM,dividendYielPercentageTTM});
            } catch (error) {
                setError(error instanceof Error ? error.message : "An error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchKeyFeatureStockData();
    }, [stockTicker]);
    return (
        <section>
            <h2 className='text-xl'>Key Features</h2>
            <p>TTM PE: {Math.round(keyFeaturesData?.peRatioTTM *100) / 100}</p>
            <p>Div Yield: {Math.round(keyFeaturesData?.dividendYielPercentageTTM * 100) / 100}%</p>
        </section>
    )
}