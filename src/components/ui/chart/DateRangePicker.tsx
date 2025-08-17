import { Button } from "../../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/consolidated/Card";
import { addMonths, format, subMonths } from "date-fns";

// Using native select instead of custom components
const SelectItem = ({ children, value }: { children: React.ReactNode; value: string }) => (
  <option value={value}>{children}</option>
);
const SelectValue = ({ placeholder }: { placeholder: string }) => placeholder;

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
}

// Pre-defined date range options
const dateRangeOptions = [
  { label: "Last 3 months", value: "3months" },
  { label: "Last 6 months", value: "6months" },
  { label: "Year to date", value: "ytd" },
  { label: "Last year", value: "1year" },
  { label: "All time", value: "all" },
];

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  // Handle preset selection
  const handlePresetChange = (value: string) => {
    const now = new Date();
    let newStart = startDate;
    let newEnd = endDate;

    switch (value) {
      case "3months":
        newStart = subMonths(now, 3);
        newEnd = now;
        break;
      case "6months":
        newStart = subMonths(now, 6);
        newEnd = now;
        break;
      case "ytd":
        newStart = new Date(now.getFullYear(), 0, 1); // Jan 1st of current year
        newEnd = now;
        break;
      case "1year":
        newStart = subMonths(now, 12);
        newEnd = now;
        break;
      case "all":
        newStart = new Date(2024, 0, 1); // Start from Jan 1, 2024
        newEnd = addMonths(now, 6); // Project 6 months into future
        break;
      default:
        break;
    }

    onChange(newStart, newEnd);
  };

  // Move range backward/forward by the current range span
  const moveRange = (direction: "back" | "forward") => {
    const rangeSpan = endDate.getTime() - startDate.getTime();
    const moveAmount = direction === "back" ? -rangeSpan : rangeSpan;

    const newStart = new Date(startDate.getTime() + moveAmount);
    const newEnd = new Date(endDate.getTime() + moveAmount);

    onChange(newStart, newEnd);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-md font-medium">Date Range</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {formatDate(startDate)} - {formatDate(endDate)}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => moveRange("back")}
                className="h-7 w-7"
              >
                ←
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => moveRange("forward")}
                className="h-7 w-7"
              >
                →
              </Button>
            </div>
          </div>

          <select
            className="w-full border rounded-md p-2"
            onChange={(e) => handlePresetChange(e.target.value)}
          >
            <option value="">Select range</option>
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}

export default DateRangePicker;
