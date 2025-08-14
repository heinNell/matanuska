// Define supported currencies in the application
export type SupportedCurrency = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "ZAR";

export const currencySymbols: Record<SupportedCurrency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
  ZAR: "R",
};

export const formatCurrency = (
  amount: number,
  currency: SupportedCurrency = "USD",
  options: Intl.NumberFormatOptions = {}
): string => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });

  return formatter.format(amount);
};
