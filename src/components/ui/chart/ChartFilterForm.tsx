import { Button } from "../../../components/ui/Button";
import { Checkbox } from "../../../components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Simple Form component for our needs
const Form = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
  <form {...props}>{children}</form>
);

// Simple FormDescription component
const FormDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-500">{children}</p>
);

// Define the schema for the form
const FormSchema = z.object({
  dataPoints: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one data point.",
  }),
});

// Define our data points
const dataPoints = [
  {
    id: "fuelConsumption",
    label: "Fuel Consumption",
  },
  {
    id: "maintenance",
    label: "Maintenance Cost",
  },
  {
    id: "utilization",
    label: "Vehicle Utilization",
  },
  {
    id: "emissions",
    label: "CO2 Emissions",
  },
  {
    id: "mileage",
    label: "Total Mileage",
  },
  {
    id: "violations",
    label: "Safety Violations",
  },
] as const;

interface ChartFilterFormProps {
  onSubmit: (values: z.infer<typeof FormSchema>) => void;
  defaultValues?: string[];
}

export function ChartFilterForm({
  onSubmit,
  defaultValues = ["fuelConsumption", "utilization"],
}: ChartFilterFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      dataPoints: defaultValues,
    },
  });

  const handleSubmit = (data: z.infer<typeof FormSchema>) => {
    onSubmit(data);
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="dataPoints"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Chart Data Points</FormLabel>
                <FormDescription>
                  Select the data points to display on the analytics chart.
                </FormDescription>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {dataPoints.map((point) => (
                  <FormField
                    key={point.id}
                    control={form.control}
                    name="dataPoints"
                    render={({ field }) => {
                      return (
                        <div
                          key={point.id}
                          className="flex flex-row items-center space-x-2 rounded-md border p-3"
                        >
                          <FormItem>
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(point.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, point.id])
                                    : field.onChange(
                                        field.value?.filter((value: string) => value !== point.id)
                                      );
                                }}
                              />
                            </FormControl>
                            <div className="font-normal ml-2">{point.label}</div>
                          </FormItem>
                        </div>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Apply Filters</Button>
      </form>
    </div>
  );
}

export default ChartFilterForm;
