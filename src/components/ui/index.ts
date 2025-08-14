/**
 * This file re-exports components from their source files
 * to prevent import casing issues across the application
 */

// Re-export Button component
export { Button } from "./Button";

// Re-export Card components
export { Card, CardContent, CardHeader, CardTitle } from "./Card";

// Re-export Alert components
export { Alert, AlertDescription, AlertTitle } from "./Alert";

// Re-export Input component
export { default as Input } from "./Input";

// Re-export Table components
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

// Re-export GenericPlaceholderPage component
export { default as GenericPlaceholderPage } from "./GenericPlaceholderPage";

// Re-export ApplicantInfoCard component - temporarily commented due to missing file
export { default as ApplicantInfoCard } from "./ApplicantInfoCard";

// Re-export new UI components
export { default as ProgressStepper } from "./ProgressStepper";
export { default as StatsCardGroup } from "./StatsCardGroup";
export { default as VerticalStepper } from "./VerticalStepper";

// Additional commonly used components
export { default as Modal } from "./Modal";
export { default as SyncIndicator } from "./SyncIndicator";
// Standardize on PascalCase Tabs implementation
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";
