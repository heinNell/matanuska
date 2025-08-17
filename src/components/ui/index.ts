/**
 * UI Components Barrel Export File
 *
 * This file re-exports components from their source files
 * to prevent import casing issues across the application.
 *
 * The barrel exports allow for cleaner imports in other files:
 * import { Button, Card, Input } from '@/components/ui';
 */

// -------------------------
// Core UI Components
// -------------------------

// Button Component
export { Button } from "./Button";

// Card Components
export { Card, CardContent, CardHeader, CardTitle } from "./Card";

// Alert Components
export { Alert, AlertDescription, AlertTitle } from "./Alert";

// Input Components
export { default as Input } from "./Input";
export { Textarea } from "./textarea";
export { Checkbox } from "./checkbox";
export { Label } from "./label";
export { Badge } from "./badge";

// Table Components
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

// Navigation Components
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

// -------------------------
// Form Components
// -------------------------

// Form components
export {
  FileUpload,
  Input as FormInput,
  Select,
  TextArea
} from "./FormElements";

export { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";

// -------------------------
// Specialized Components
// -------------------------

// Status & Progress Components
export { default as LoadingIndicator } from "./LoadingIndicator";
export { default as SyncIndicator } from "./SyncIndicator";
export { default as OfflineBanner } from "./OfflineBanner";
export { default as ConnectionStatusIndicator } from "./ConnectionStatusIndicator";
export { default as FirestoreConnectionError } from "./FirestoreConnectionError";

// Page Components
export { default as GenericPlaceholderPage } from "./GenericPlaceholderPage";
export { default as PageWrapper } from "./PageWrapper";

// Dialog Components
export { default as Modal } from "./Modal";
export { Tooltip } from "./Tooltip";

// Step Components
export { default as ProgressStepper } from "./ProgressStepper";
export { default as StatsCardGroup } from "./StatsCardGroup";
export { default as VerticalStepper } from "./VerticalStepper";

// Display Components
export { default as ApplicantInfoCard } from "./ApplicantInfoCard";
export { InspectionItemCard } from "./InspectionItemCard";
export { default as Calendar } from "./Calendar";
export { default as UnitsTable } from "./UnitsTable";

// Error Display
export { default as ErrorMessage } from "./ErrorMessage";

// -------------------------
// Data Visualization
// -------------------------
export * from "./chart";

// -------------------------
// Provider Components
// -------------------------
export { default as AntDesignProvider } from "./AntDesignProvider";
export { default as AntDesignWrapper } from "./AntDesignWrapper";
