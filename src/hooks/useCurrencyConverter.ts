import { useState, useEffect } from 'react';

export function useCurrencyConverter() {
  const [exchangeRate, setExchangeRate] = useState<number>(18.5); // fallback rate
  const [activeCurrency, setActiveCurrency] = useState<'ZAR' | 'USD'>('ZAR');

  useEffect(() => {
    // Fetch latest from Firebase or external API
    // In a real implementation, we would fetch from an API or Firestore
    // Here using a mock value since API calls are out of scope
    const fetchExchangeRate = async () => {
      try {
        // This would be an actual API call in production
        // For example: const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        // const data = await response.json();
        // setExchangeRate(data.rates.ZAR || 18.5);
        
        // Simulating API response delay
        setTimeout(() => {
          setExchangeRate(18.5);
        }, 500);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };
    
    fetchExchangeRate();
    
    // Refresh every hour in a production environment
    // const interval = setInterval(fetchExchangeRate, 3600000);
    // return () => clearInterval(interval);
  }, []);

  const convertZarToUsd = (zar: number): number => {
    if (!zar) return 0;
    return Number((zar / exchangeRate).toFixed(2));
  };

  const convertUsdToZar = (usd: number): number => {
    if (!usd) return 0;
    return Number((usd * exchangeRate).toFixed(2));
  };

  const formatCurrency = (amount: number, forceCurrency?: 'ZAR' | 'USD'): string => {
    const currency = forceCurrency || activeCurrency;
    
    if (currency === 'USD') {
      const value = forceCurrency ? convertZarToUsd(amount) : amount;
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      const value = forceCurrency ? convertUsdToZar(amount) : amount;
      return `R${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const toggleCurrency = () => {
    setActiveCurrency(prev => prev === 'ZAR' ? 'USD' : 'ZAR');
  };

  return {
    convertZarToUsd,
    convertUsdToZar,
    formatCurrency,
    toggleCurrency,
    activeCurrency,
    exchangeRate
  };
}
