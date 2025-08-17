# UI Components System

This document provides an overview of the UI components system in the Matanuska project.

## Directory Structure

The UI components are located in `src/components/ui/` and include:

- Core UI components like `Button`, `Card`, `Input`, etc.
- Specialized components for forms, tables, and charts
- Modal dialogs and notification components
- Status indicators and loaders

## Import Patterns

There are two ways to import UI components:

### 1. Barrel Import (Recommended)

```typescript
// Import multiple components at once
import { Button, Card, CardContent } from '@/components/ui';
```

This pattern uses the barrel export file (`src/components/ui/index.ts`) which re-exports components to prevent import casing issues across the application.

### 2. Direct Import

```typescript
// Import directly from the component file
import { Button } from '@/components/ui/Button';
```

This pattern imports directly from the component file and is useful when you need just one component or when the component is not exported from the barrel file.

## Adding New Components

When adding new UI components:

1. Create your component file in the `src/components/ui/` directory using PascalCase for the filename (e.g., `MyComponent.tsx`)
2. Add the component export to `src/components/ui/index.ts` to make it available through the barrel import
3. Document the component's props and usage

## Best Practices

- Use the barrel import when importing multiple components
- Keep components focused on a single responsibility
- Follow the existing naming conventions
- Provide proper TypeScript type definitions for all components
- When in doubt, check existing components for patterns to follow

## Available Components

The UI system includes components for:

- Buttons and interactive elements
- Form elements (Input, Select, Checkbox, etc.)
- Layout components (Card, TabsPanel, etc.)
- Feedback components (Alert, LoadingIndicator, etc.)
- Data display (Table, Badge, etc.)
- Charts and data visualization

Refer to the individual component files for detailed documentation and examples.
