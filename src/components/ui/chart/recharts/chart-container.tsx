import React from "react";

export interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
  };
}

interface ChartContainerProps {
  config: ChartConfig;
  className?: string;
  children: React.ReactNode;
}

export function ChartContainer({ config, className, children }: ChartContainerProps) {
  return (
    <div className={className} data-chart-config={JSON.stringify(config)}>
      {children}
    </div>
  );
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
}

export function ChartTooltip({ children, ...props }: ChartTooltipProps & { children?: React.ReactNode }) {
  return <div {...props}>{children}</div>;
}

interface ChartTooltipContentProps {
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
}

export function ChartTooltipContent({
  hideLabel = false,
  hideIndicator = false,
  indicator = "line",
  nameKey = "name",
  labelKey = "value"
}: ChartTooltipContentProps) {
  return (
    <div className="chart-tooltip-content">
      {!hideIndicator && (
        <div className={`chart-indicator ${indicator}`} />
      )}
      {!hideLabel && (
        <div className="chart-label">
          <span className="name">{nameKey}</span>
          <span className="label">{labelKey}</span>
        </div>
      )}
    </div>
  );
}
