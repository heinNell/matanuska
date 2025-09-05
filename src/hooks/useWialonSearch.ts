import { useState, useCallback } from 'react';
import { WialonServiceComplete } from '@/services/WialonServiceComplete';
import type { WialonSearchItemsResult, ProcessedSearchData } from '@/services/WialonServiceComplete';

export function useWialonSearch() {
  const [searchResults, setSearchResults] = useState<WialonSearchItemsResult | null>(null);
  const [processedResults, setProcessedResults] = useState<ProcessedSearchData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const wialonService = new WialonServiceComplete();

  const searchVehicles = useCallback(async (searchTerm: string) => {
    setIsSearching(true);
    setError(null);

    try {
      const results = await wialonService.searchVehicles(searchTerm);
      const processed = wialonService.processSearchResults(results);

      setSearchResults(results);
      setProcessedResults(processed);
    } catch (err) {
      setError(err as Error);
      console.error('Vehicle search failed:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    searchResults,
    processedResults,
    isSearching,
    error,
    searchVehicles
  };
}
