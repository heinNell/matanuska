import { useMemo } from "react";

interface TransformOptions {
  // Sort options
  sortBy?: string;
  sortDirection?: "asc" | "desc";

  // Filter options
  filters?: Record<string, any>;

  // Aggregation options
  aggregate?: {
    groupBy: string;
    method: "sum" | "avg" | "min" | "max" | "count";
    field?: string;
  };

  // Transformation options
  transform?: {
    type: "percentage" | "cumulative" | "rolling" | "growth";
    field: string;
    windowSize?: number; // For rolling calculations
  }[];

  // Limit the number of results
  limit?: number;
}

/**
 * Custom hook for transforming chart data
 *
 * @param data Original data array
 * @param options Transformation options
 * @returns Transformed data array
 */
export function useChartDataTransform<T>(data: T[], options: TransformOptions = {}): T[] {
  return useMemo(() => {
    if (!data?.length) return [];

    let result = [...data];

    // Apply filters
    if (options.filters) {
      result = result.filter((item) => {
        return Object.entries(options.filters || {}).every(([key, value]) => {
          if (value === undefined || value === null) return true;
          return (item as any)[key] === value;
        });
      });
    }

    // Apply aggregation
    if (options.aggregate) {
      const { groupBy, method, field } = options.aggregate;
      const groups: Record<string, T[]> = {};

      // Group the data
      result.forEach((item) => {
        const key = String((item as any)[groupBy]);
        groups[key] = groups[key] || [];
        groups[key].push(item);
      });

      // Apply aggregation method to each group
      result = Object.entries(groups).map(([key, items]) => {
        const base = { ...items[0], [groupBy]: key };

        if (!field) return base;

        let value: number;

        switch (method) {
          case "sum":
            value = items.reduce((sum, item) => sum + Number((item as any)[field]), 0);
            break;
          case "avg":
            value =
              items.reduce((sum, item) => sum + Number((item as any)[field]), 0) / items.length;
            break;
          case "min":
            value = Math.min(...items.map((item) => Number((item as any)[field])));
            break;
          case "max":
            value = Math.max(...items.map((item) => Number((item as any)[field])));
            break;
          case "count":
            value = items.length;
            break;
          default:
            value = 0;
        }

        return { ...base, [field]: value };
      });
    }

    // Apply transformations
    if (options.transform && options.transform.length > 0) {
      options.transform.forEach((transform) => {
        const { type, field, windowSize = 3 } = transform;

        switch (type) {
          case "percentage":
            // Convert values to percentage of total
            const total = result.reduce((sum, item) => sum + Number((item as any)[field]), 0);
            result = result.map((item) => ({
              ...item,
              [field]: (Number((item as any)[field]) / total) * 100,
            }));
            break;

          case "cumulative":
            // Calculate cumulative sum
            let cumulative = 0;
            result = result.map((item) => {
              cumulative += Number((item as any)[field]);
              return { ...item, [field]: cumulative };
            });
            break;

          case "rolling":
            // Calculate rolling average
            if (windowSize > 0) {
              result = result.map((item, index) => {
                if (index < windowSize - 1) return item;

                const windowItems = result.slice(index - windowSize + 1, index + 1);
                const windowAvg =
                  windowItems.reduce((sum, wItem) => sum + Number((wItem as any)[field]), 0) /
                  windowSize;

                return { ...item, [field]: windowAvg };
              });
            }
            break;

          case "growth":
            // Calculate growth rate compared to previous period
            result = result.map((item, index) => {
              if (index === 0) return { ...item, [field]: 0 };

              const prevValue = Number((result[index - 1] as any)[field]);
              const currentValue = Number((item as any)[field]);

              if (prevValue === 0) return { ...item, [field]: 0 };

              const growthRate = ((currentValue - prevValue) / prevValue) * 100;
              return { ...item, [field]: growthRate };
            });
            break;
        }
      });
    }

    // Sort data
    if (options.sortBy) {
      const direction = options.sortDirection === "desc" ? -1 : 1;
      result.sort((a, b) => {
        const valueA = (a as any)[options.sortBy!];
        const valueB = (b as any)[options.sortBy!];

        if (typeof valueA === "string" && typeof valueB === "string") {
          return direction * valueA.localeCompare(valueB);
        }

        return direction * (Number(valueA) - Number(valueB));
      });
    }

    // Apply limit
    if (options.limit && options.limit > 0) {
      result = result.slice(0, options.limit);
    }

    return result;
  }, [data, options]);
}

export default useChartDataTransform;
