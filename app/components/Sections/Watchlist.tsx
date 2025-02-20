import { useAuth } from "@/app/hooks/useAuth";
import { getWatchlistData } from "@/app/firebase/firebase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Watchlist() {
    const { user, loading } = useAuth();
    const [watchlistStocks, setWatchlistStocks] = useState<string[]>([]); // Corrected state type

    useEffect(() => {
        if (user?.uid) {  // Ensure user is defined and has a UID
            const getWatchlist = async () => {
                try {
                    const data = await getWatchlistData(user.uid); // Correctly fetch data for the user
                    setWatchlistStocks(data);
                } catch (error) {
                    console.error("Error fetching watchlist:", error);
                }
            };

            getWatchlist();
            // console.log(watchlistStocks)
        }

    }, [user]);

    return (
        <div>
            <h2 className='text-xl'>Watchlist</h2>

        <ul>
            {watchlistStocks.map((stockTicker, index) => (
                <li key={index}>
                    <Link href={`/${stockTicker}`}>{stockTicker}</Link></li> // Added key for each list item
            ))}
        </ul>
        </div>
    );
}