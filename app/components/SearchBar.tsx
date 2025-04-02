
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {useStock} from "@/app/hooks/useStock";


type SearchBarStocks = {
    symbol: string;
    name: string;
}

export function SearchBar() {
    const { apiKey } = useStock();
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<SearchBarStocks[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!searchText.trim()) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                const response = await fetch(
                    `https://financialmodelingprep.com/api/v3/search?query=${searchText}&limit=5&apikey=${apiKey}`
                );
                if (!response.ok) throw new Error("Failed to fetch suggestions");
                const data = await response.json();
                setSuggestions(data);
            } catch (err) {
                setError(`Error fetching suggestions, ${err}`);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchText,apiKey]);

    const stockSearch = (e) => {
        e.preventDefault();
        if (!searchText.trim()) {
            setError("Ticker cannot be empty.");
            return;
        }
        router.push(`/${searchText.trim()}`);
        setSearchText("");
        setSuggestions([]);
    };

    return (
        <div className="relative">
            <form onSubmit={stockSearch} className='flex'>

                <div className="relative w-[300px] ">
                    <input
                        className="p-6 border-2 border-indigo-600 rounded-md w-full pr-10"
                        value={searchText}
                        type="text"
                        placeholder="Enter a stock ticker e.g. TSLA"
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    {searchText && (
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                            onClick={() => {

                                setSearchText("")
                        setSuggestions([])
                            }
                            }
                        >
                            ❌
                        </button>
                    )}
                </div>
                <button type="submit" className="p-2">Search</button>
            </form>

            {suggestions?.length > 0 && (
                <ul className="absolute bg-white border border-gray-300 w-[300px] mt-1 rounded-md shadow-lg">
                    {suggestions.map((stock:SearchBarStocks) => (
                        <li
                            key={stock.symbol}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                                router.push(`/${stock.symbol}`);
                                setSearchText("");
                                setSuggestions([]);
                            }}
                        >
                            {stock.symbol} - {stock.name}
                        </li>
                    ))}
                </ul>
            )}

            {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
    );
}

