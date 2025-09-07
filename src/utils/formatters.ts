/**
 * Format a number as currency
 * @param value Number to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value);
}

/**
 * Format a date as a readable string
 * @param date Date to format
 * @param format Format style ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, format: 'short' | 'medium' | 'long' = 'medium'): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'numeric' : 'long',
    day: 'numeric'
  };

  if (format === 'long') {
    options.hour = 'numeric';
    options.minute = 'numeric';
  }

  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}
