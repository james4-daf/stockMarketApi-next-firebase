export function useStock() {
    const apiKey = process.env.NEXT_PUBLIC_STOCK_MARKET_API_KEY;

    if (!apiKey) {
        console.error("Stock API key is missing! Add it to .env.local");
    }

    return { apiKey };
}