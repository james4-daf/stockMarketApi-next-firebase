// app/hooks/useFetchWithCredits.ts
import { useState } from 'react';

export const useFetchWithApiLimit = () => {
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchWithApiLimit = async (url: string, options = {}) => {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = `Error ${response.status}: ${response.statusText}`;
        console.error(errorText);

        // Handle 403 or 429 specifically as "out of credits"
        if (response.status === 403 || response.status === 429) {
          setApiError(
            '⚠️ You have run out of daily API credits. Please try again tomorrow.',
          );
        }

        throw new Error(errorText);
      }

      return response.json();
    } catch (error) {
      console.error('API Fetch Error:', error);
      setApiError('An error occurred while fetching data. Please try again.');
      throw error;
    }
  };

  const clearError = () => setApiError(null);

  return { fetchWithApiLimit, apiError, clearError };
};
