import React, { Suspense, lazy, memo } from "react";

interface LazyChartProps {
  chartComponent: React.ComponentType<any>;
  fallback?: React.ReactNode;
  props?: Record<string, any>;
}

// Loading placeholder
const ChartLoadingPlaceholder = () => (
  <div className="w-full h-64 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
    <p className="text-gray-500">Loading chart...</p>
  </div>
);

// Higher-order component to optimize chart rendering
export const OptimizedChart = memo(
  ({
    chartComponent: ChartComponent,
    fallback = <ChartLoadingPlaceholder />,
    props = {},
  }: LazyChartProps) => {
    return (
      <Suspense fallback={fallback}>
        <ChartComponent {...props} />
      </Suspense>
    );
  }
);

// Lazy load chart components
export const lazyLoadChart = (importFunc: () => Promise<{ default: React.ComponentType<any> }>) => {
  return lazy(importFunc);
};

export default OptimizedChart
