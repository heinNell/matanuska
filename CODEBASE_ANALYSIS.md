# Matanuska Transport Platform Codebase Analysis

## Overview

The Matanuska Transport Platform is a comprehensive fleet management system designed to handle the complex operations of a transportation company. The application is built with modern web technologies including React, TypeScript, and Firebase, with additional integrations for Google Maps and Wialon (a GPS tracking platform).

## Key Modules

Based on the codebase analysis, the platform consists of several interconnected modules:

1. **Trip Management**: Handles planning, execution, and monitoring of vehicle trips including route optimization and load planning.
2. **Invoice Management**: Manages the creation, approval, and tracking of invoices and payments.
3. **Diesel/Fuel Management**: Tracks fuel consumption, costs, efficiency, and detects potential theft.
4. **Client Management**: Maintains client information, relationships, and reporting.
5. **Driver Management**: Handles driver profiles, performance tracking, scheduling, and compliance.
6. **Workshop Management**: Manages vehicle maintenance, inspections, and repairs.
7. **Tyre Management**: Tracks tyre inventory, performance, inspections, and replacements.
8. **Inventory Management**: Manages parts inventory, purchase orders, and vendor relationships.
9. **Wialon Integration**: Connects with the Wialon GPS tracking platform for real-time vehicle tracking.
10. **Compliance & Safety**: Tracks regulatory compliance, safety inspections, and incident reporting.
11. **Analytics & Reporting**: Provides business intelligence and reporting capabilities.

## Architecture

The application follows a modular React architecture with the following key characteristics:

1. **Component-Based Structure**: UI elements are organized as reusable components.
2. **Context API for State Management**: Uses React Context for managing global state.
3. **Firebase Integration**: Utilizes Firebase for authentication, database, and storage.
4. **Offline-First Capabilities**: Implements offline data synchronization and operation queuing.
5. **Mobile Support**: Includes Capacitor integration for mobile deployment with QR scanning capabilities.
6. **Dynamic Routing**: Routes are generated from a central configuration that matches the sidebar navigation.

## Src Directory Structure

```
src/
├── api/                 # API integrations (Firebase, Wialon)
├── assets/              # Static assets
├── components/          # UI components organized by module
│   ├── Adminmangement/
│   ├── clients/
│   ├── common/
│   ├── Cost Management/
│   ├── DieselManagement/
│   ├── DriverManagement/
│   ├── forms/
│   ├── Inventory Management/
│   ├── InvoiceManagement/
│   ├── layout/
│   ├── lists/
│   ├── Map/
│   ├── maps/
│   ├── misc/
│   ├── mobile/
│   ├── Models/
│   ├── testing/
│   ├── TripManagement/
│   ├── Tyremanagement/
│   ├── tyres/
│   ├── ui/
│   └── WorkshopManagement/
├── config/              # Application configuration
├── context/             # React Context providers
├── data/                # Static data and templates
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── pages/               # Page components organized by module
│   ├── clients/
│   ├── diesel/
│   ├── drivers/
│   ├── examples/
│   ├── invoices/
│   ├── mobile/
│   ├── trips/
│   ├── tyres/
│   └── workshop/
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Potential Duplicate Files

During analysis, several potentially duplicate or closely related files were identified. These files may contain similar functionality that could be consolidated while preserving all features:

### Case-Sensitive UI Component Duplicates

1. **Badge Components**:
   - `components/ui/badge.tsx`
   - `components/ui/Badge.tsx`

2. **Button Components**:
   - `components/ui/button.tsx`
   - `components/ui/Button.tsx`

3. **Card Components**:
   - `components/ui/card.tsx`
   - `components/ui/Card.tsx`

4. **Input Components**:
   - `components/ui/input.tsx`
   - `components/ui/Input.tsx`

5. **Modal Components**:
   - `components/ui/modal.tsx`
   - `components/ui/Modal.tsx`

### Similar Functionality in Different Locations

6. **UIConnector Components**:
   - `components/UIConnector.tsx`
   - `components/testing/UIConnector.tsx`
   - `components/ui/UIConnector.tsx`

7. **GeofenceModal Components**:
   - `components/GeofenceModal.tsx`
   - `components/Models/GeofenceModal.tsx`

8. **Map Components**:
   - `components/Map/MapsView.tsx`
   - `components/Map/pages/Maps.tsx`
   - `components/maps/EnhancedMapComponent.tsx`
   - `components/Map/WialonMapComponent.tsx`

9. **Wialon Unit List Components**:
   - `components/Map/wialon/WialonUnitList.tsx`
   - `components/Map/wialon/WialonUnitsList.tsx`
   - `hooks/WialonUnitList.tsx`

### Module Components with Similar Functionality

10. **Diesel/Fuel Components**:
    - `components/DieselManagement/FuelLogs.tsx`
    - `pages/diesel/FuelLogs.tsx`
    - `components/DieselManagement/DieselDashboardComponent.tsx`
    - `pages/diesel/DieselDashboardComponent.tsx`

11. **Driver Components**:
    - `components/DriverManagement/DriverFuelBehavior.tsx`
    - `pages/drivers/DriverFuelBehavior.tsx`
    - `components/TripManagement/EditDriver.tsx`
    - `pages/drivers/EditDriver.tsx`

12. **Trip Form Variants**:
    - `components/forms/TripForm.tsx`
    - `components/forms/TripForm2.tsx`
    - `pages/trips/TripForm.tsx`

13. **Receive Parts Components**:
    - `components/Inventory Management/receive-parts.tsx`
    - `components/WorkshopManagement/receive-parts.tsx`

14. **Diesel Modal Variants**:
    - `components/Models/Diesel/DieselDebriefModal.tsx`
    - `components/Models/Diesel/EnhancedDieselDebriefModal.tsx`
    - `components/Models/Diesel/AutomaticProbeVerificationModal.tsx`
    - `components/Models/Diesel/EnhancedProbeVerificationModal.tsx`

15. **QR Generator Components**:
    - `components/WorkshopManagement/QRGenerator.tsx`
    - `pages/workshop/QRGenerator.tsx`

16. **Vehicle Tyre View Components**:
    - `pages/VehicleTyreView.tsx`
    - `pages/VehicleTyreViewA.tsx`

## Consolidation Strategy

For each set of duplicate or related files, the following consolidation strategy is recommended:

1. **Identify the Primary File**: Determine which file should be the main implementation based on usage patterns and completeness.

2. **Merge Functionality**: Enhance the primary file by adding any unique functionality from the duplicate file(s).

3. **Update References**: Update all imports to reference the primary file.

4. **Create Re-Exports**: For backward compatibility, create re-export files that import from the primary implementation.

For example, to consolidate the Badge components:

1. Choose `components/ui/Badge.tsx` as the primary file
2. Merge any unique functionality from `components/ui/badge.tsx`
3. Create a re-export in `components/ui/badge.tsx` that exports from `Badge.tsx`

By following this approach, we can maintain all functionality while eliminating code duplication.

## Conclusion

The Matanuska Transport Platform is a comprehensive fleet management system with a well-structured codebase. By consolidating duplicate files, we can improve code maintainability and reduce potential inconsistencies while ensuring all functionality is preserved. This analysis provides a starting point for the consolidation effort by identifying specific files that could be combined.

## Detailed Consolidation Example: UIConnector Components

After examining all three UIConnector components in detail, we've identified a clear consolidation opportunity:

### Current State

1. **src/components/UIConnector.tsx** and **src/components/ui/UIConnector.tsx**
   - These two files are identical, containing the same code
   - Both analyze buttons, forms, and input elements
   - Both have a UI with toggleable report display and highlight functionality
   - Both contain the same bug: onClick handlers reference undefined functions (should use toggleReport and toggleConnector)

2. **src/components/testing/UIConnector.tsx**
   - Unique implementation with similar purpose but different UI
   - Tracks links in addition to buttons and forms (but not inputs)
   - Provides more granular highlighting (can highlight only connected buttons, etc.)
   - Has a collapsible UI with a different layout and styling
   - Also contains onClick handler bugs

### Consolidation Strategy

1. **Primary Implementation**: Create a unified `src/components/ui/UIConnector.tsx` that combines all functionality

2. **Feature Preservation**:
   - Analyze all UI element types (buttons, forms, inputs, links)
   - Include both report view styles (simple and detailed)
   - Support both general highlighting and type-specific highlighting
   - Fix all event handler bugs

3. **Re-export Files**:
   - Maintain backward compatibility by creating re-export files

### Implementation Plan

1. **Enhanced Primary Component**:

```tsx
// src/components/ui/UIConnector.tsx
import React, { useState, useEffect } from "react";

// Enhanced types to include links
type UIStatus = {
  totalElements: number;
  connectedElements: number;
  disconnectedElements: number;
  details: {
    buttons: { total: number; connected: number };
    forms: { total: number; connected: number };
    inputs: { total: number; connected: number };
    links: { total: number; connected: number };
  };
};

interface UIConnectorProps {
  variant?: "simple" | "detailed";
  defaultOpen?: boolean;
}

/**
 * UIConnector Component
 *
 * Provides real-time UI connection monitoring by highlighting
 * connected and disconnected UI elements. Useful for testing and
 * development to ensure all interactive elements have proper handlers.
 */
const UIConnector: React.FC<UIConnectorProps> = ({ variant = "simple", defaultOpen = true }) => {
  // State management
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [highlightActive, setHighlightActive] = useState<boolean>(false);
  const [highlightType, setHighlightType] = useState<string>("all");
  const [highlightConnection, setHighlightConnection] = useState<boolean | null>(null);

  // UI status tracking
  const [status, setStatus] = useState<UIStatus>({
    totalElements: 0,
    connectedElements: 0,
    disconnectedElements: 0,
    details: {
      buttons: { total: 0, connected: 0 },
      forms: { total: 0, connected: 0 },
      inputs: { total: 0, connected: 0 },
      links: { total: 0, connected: 0 },
    },
  });

  // Main functionality implementation
  // ...

  // Event handler detection methods
  // ...

  // UI rendering based on variant type
  // ...
};

export default UIConnector;
```

2. **Re-export Files**:

```tsx
// src/components/UIConnector.tsx
import UIConnector from "./ui/UIConnector";
export default UIConnector;
```

```tsx
// src/components/testing/UIConnector.tsx
import UIConnector from "../ui/UIConnector";
// Re-export with the detailed variant as default
export default (props) => <UIConnector variant="detailed" {...props} />;
```

### Benefits of Consolidation

1. **Single Source of Truth**: One canonical implementation reduces maintenance burden
2. **No Functionality Loss**: All features from all versions are preserved
3. **Bug Fixes**: Consolidation provides an opportunity to fix existing bugs
4. **Enhanced Functionality**: The unified component offers more features than any individual version
5. **Backward Compatibility**: Re-export files ensure existing imports continue to work

This approach adheres to the requirement of not deleting or commenting out any functionality while eliminating duplicate code.

## Additional Consolidation Example: Badge Components

After analyzing the Badge components, we've identified another clear consolidation opportunity:

### Current State

1. **src/components/ui/badge.tsx** (lowercase)
   - Comprehensive implementation with multiple variants, sizes, and optional status dots
   - Uses the `cn` utility function for class name composition
   - Provides a detailed TypeScript interface with JSDoc documentation
   - Supports variants: 'default', 'destructive', 'outline', 'success', 'warning', 'info', 'secondary'
   - Supports sizes: 'small', 'medium', 'large'
   - Has the optional `withDot` feature for status indicators

2. **src/components/ui/Badge.tsx** (uppercase)
   - Simpler implementation with minimal props (children and className)
   - No variant or size options
   - Exports both a named export and a default export
   - Uses a React.FC type annotation
   - Limited styling options

### Consolidation Strategy

1. **Primary Implementation**: Keep the more feature-rich `badge.tsx` as the canonical implementation

2. **Feature Preservation**:
   - Maintain all variant, size, and status dot options from the lowercase version
   - Add default export to match the uppercase version's export style
   - Ensure className handling is compatible with both implementations

3. **Backward Compatibility**:
   - Modify `Badge.tsx` to re-export from `badge.tsx`
   - This ensures all existing imports continue to work without changes

### Implementation Plan

1. **Update Primary Implementation (badge.tsx)**:

````tsx
// src/components/ui/badge.tsx
import React from "react";
import { cn } from "@/utils/cn";

/**
 * Badge Component
 *
 * A versatile badge component that displays short pieces of information with
 * different visual styles based on their context or importance.
 *
 * @example
 * ```tsx
 * <Badge>Default</Badge>
 * <Badge variant="success">Completed</Badge>
 * <Badge variant="warning" size="large">Attention</Badge>
 * <Badge variant="info" withDot>New</Badge>
 * ```
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style variant of the badge */
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info"
    | "secondary"
    | "custom";
  /** Size variant of the badge */
  size?: "small" | "medium" | "large";
  /** Whether to show a status dot indicator */
  withDot?: boolean;
  /** Badge content */
  children: React.ReactNode;
}

export function Badge({
  className,
  variant = "default",
  size = "medium",
  withDot = false,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        // Size variations
        {
          "px-1.5 py-0.5 text-xs": size === "small",
          "px-2.5 py-0.5 text-xs": size === "medium",
          "px-3 py-1 text-sm": size === "large",
        },
        // Color variations
        {
          "bg-gray-100 text-gray-800": variant === "default",
          "bg-red-100 text-red-800": variant === "destructive",
          "bg-green-100 text-green-800": variant === "success",
          "bg-yellow-100 text-yellow-800": variant === "warning",
          "bg-blue-100 text-blue-800": variant === "info",
          "bg-purple-100 text-purple-800": variant === "secondary",
          "border border-gray-200 bg-white text-gray-900": variant === "outline",
        },
        className
      )}
      {...props}
    >
      {withDot && (
        <span
          className={cn("mr-1 h-2 w-2 rounded-full", {
            "bg-gray-500": variant === "default" || variant === "outline",
            "bg-red-500": variant === "destructive",
            "bg-green-500": variant === "success",
            "bg-yellow-500": variant === "warning",
            "bg-blue-500": variant === "info",
            "bg-purple-500": variant === "secondary",
          })}
        />
      )}
      {props.children}
    </div>
  );
}

// Add default export for compatibility with uppercase version
export default Badge;
````

2. **Create Re-export File (Badge.tsx)**:

```tsx
// src/components/ui/Badge.tsx
import { Badge as BadgeComponent } from "./badge";

// Re-export the Badge component with both named and default exports
// to maintain backward compatibility
export const Badge = BadgeComponent;
export default Badge;
```

### Benefits of Consolidation

1. **Code Duplication Reduction**: Eliminates redundant code while preserving all functionality
2. **Consistent API**: Provides a single, consistent API for Badge components
3. **Enhanced Maintainability**: All Badge-related changes only need to be made in one place
4. **Feature-Rich Component**: All imports get access to the full range of Badge features
5. **No Breaking Changes**: Existing code continues to work without modification

This consolidation approach ensures that no functionality is lost or commented out, adhering to the requirement to preserve all code while eliminating duplication.

## Advanced Consolidation Example: Button Components

The Button components present a more complex consolidation challenge due to their significantly different implementations:

### Current State

1. **src/components/ui/button.tsx** (lowercase)
   - Uses React's `forwardRef` to forward refs to the button element
   - Has variants: 'default', 'destructive', 'outline', 'secondary', 'ghost', 'link'
   - Has sizes: 'default', 'sm', 'lg', 'icon'
   - Uses the 'cn' utility function for class name composition
   - Includes a `ButtonWithHandler` component with a bug (references 'onClick' instead of 'handleClick')
   - Uses specialized styling for focus states

2. **src/components/ui/Button.tsx** (uppercase)
   - Doesn't use forwardRef
   - Has variants: 'primary', 'secondary', 'outline', 'danger', 'success'
   - Has sizes: 'xs', 'sm', 'md', 'lg'
   - Uses Record<Type, string> for variant and size classes
   - Includes additional props: icon, isLoading, fullWidth
   - Has loading spinner indicator
   - Exports both named and default exports

### Consolidation Strategy

1. **Enhanced Primary Implementation**: Create a unified `button.tsx` that combines all functionality

2. **Feature Preservation**:
   - Include all variants from both components
   - Support all size options from both components
   - Implement forwardRef for proper ref handling
   - Add support for icon, isLoading, and fullWidth props
   - Fix the ButtonWithHandler bug
   - Maintain all styling options

3. **Re-export File**:
   - Create a re-export file for backward compatibility

### Implementation Plan

1. **Enhanced Primary Component**:

```tsx
// src/components/ui/button.tsx
import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

export type ButtonVariant =
  | "default" // from lowercase
  | "primary" // from uppercase (equivalent to default)
  | "destructive" // from lowercase
  | "danger" // from uppercase (equivalent to destructive)
  | "outline" // from both
  | "secondary" // from both
  | "ghost" // from lowercase
  | "link" // from lowercase
  | "success"; // from uppercase

export type ButtonSize =
  | "default"
  | "sm"
  | "lg"
  | "icon" // from lowercase
  | "xs"
  | "md"; // from uppercase

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode; // from uppercase
  isLoading?: boolean; // from uppercase
  fullWidth?: boolean; // from uppercase
  children?: React.ReactNode;
  className?: string;
}

// Map equivalent variants for compatibility
const variantMapping = {
  primary: "default",
  danger: "destructive",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      icon,
      isLoading,
      fullWidth,
      children,
      ...props
    },
    ref
  ) => {
    // Map variant if an equivalent exists
    const mappedVariant = variantMapping[variant as keyof typeof variantMapping] || variant;

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",

          // Variant styles (combined from both implementations)
          {
            "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500":
              mappedVariant === "default",
            "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500":
              mappedVariant === "destructive",
            "border border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-gray-500":
              mappedVariant === "outline",
            "bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500":
              mappedVariant === "secondary",
            "hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500":
              mappedVariant === "ghost",
            "text-blue-600 hover:underline": mappedVariant === "link",
            "bg-green-500 text-white hover:bg-green-600 focus-visible:ring-green-400":
              mappedVariant === "success",
          },

          // Size styles (combined from both implementations)
          {
            "h-10 px-4 py-2": size === "default" || size === "md",
            "h-8 px-3 text-sm": size === "sm",
            "h-12 px-6 text-lg": size === "lg",
            "h-9 w-9 p-0": size === "icon",
            "px-2.5 py-1.5 text-xs": size === "xs",
          },

          // Fullwidth style
          fullWidth ? "w-full" : "",

          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// Fixed version of ButtonWithHandler (correcting the onClick bug)
const ButtonWithHandler = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      props.onClick(event);
    }
  };

  return <Button {...props} onClick={handleClick} ref={ref} />;
});

ButtonWithHandler.displayName = "ButtonWithHandler";

export { Button, ButtonWithHandler };
export default Button;
```

2. **Re-export File**:

```tsx
// src/components/ui/Button.tsx
import { Button, ButtonProps } from "./button";

// Re-export everything for backward compatibility
export type { ButtonProps };
export { Button };
export default Button;
```

### Benefits of This Approach

1. **Comprehensive Feature Set**: Preserves all functionality from both versions
2. **Bug Fixes**: Corrects the `handleClick` bug in ButtonWithHandler
3. **Enhanced Type Safety**: Combines and clearly documents all prop types
4. **Backward Compatibility**: Ensures existing code continues to work without changes
5. **Improved Maintainability**: Single source of truth for Button components
6. **Feature Enhancement**: Users of either component now have access to all features

This consolidation pattern demonstrates how to handle more complex component variations while still preserving all functionality and maintaining backward compatibility.

## Architectural Consolidation Example: Card Components

The Card components represent a case where two implementations have fundamentally different architectural approaches, both with unique strengths:

### Current State

1. **src/components/ui/card.tsx** (lowercase)
   - Uses React's `forwardRef` for all components
   - Simple component structure with Card, CardHeader, and CardContent
   - Basic props interface (children, className)
   - Uses the `cn` utility function for class name composition
   - Consistent styling with gray color palette
   - Named exports only, no default export

2. **src/components/ui/Card.tsx** (uppercase)
   - Uses compound component pattern (Card.Header, Card.Content, Card.Footer)
   - No forwardRef usage
   - Rich props for CardHeader (title, subtitle, icon, action)
   - Includes additional components: CardFooter and CardTitle
   - Uses template literals for className composition
   - More specific styling with slate color palette
   - Both named and default exports

### Consolidation Strategy

This case requires preserving both architectural approaches while unifying the API and features:

1. **Enhanced Architecture**:
   - Adopt the compound component pattern (Card.Header, etc.)
   - Implement forwardRef for all components
   - Include all props from both implementations
   - Ensure consistent styling

2. **Feature Preservation**:
   - Include CardFooter and CardTitle from uppercase version
   - Support all CardHeader props (title, subtitle, icon, action)
   - Maintain styling options from both versions
   - Support both named and default exports

### Implementation Plan

1. **Enhanced Primary Component**:

```tsx
// src/components/ui/card.tsx
import React, { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

// Card Component
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("bg-white rounded-lg shadow-md overflow-hidden", className)}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = "Card";

// CardHeader Component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  // Additional props from uppercase version
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, title, subtitle, icon, action, ...props }, ref) => {
    // If using the component composition style (children)
    if (children) {
      return (
        <div ref={ref} className={cn("px-6 py-4 border-b border-gray-200", className)} {...props}>
          {children}
        </div>
      );
    }

    // If using the props-based style (title, subtitle, etc.)
    return (
      <div
        ref={ref}
        className={cn(
          "px-6 py-4 border-b border-gray-200 flex justify-between items-center",
          className
        )}
        {...props}
      >
        <div className="flex flex-col">
          {icon && <div className="mr-2">{icon}</div>}
          {title && <h3 className="text-xl font-semibold text-gray-800">{title}</h3>}
          {subtitle && <div className="mt-1">{subtitle}</div>}
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);
CardHeader.displayName = "CardHeader";

// CardContent Component
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("p-6", className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = "CardContent";

// CardFooter Component (from uppercase version)
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 py-3 bg-gray-50 border-t border-gray-200", className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = "CardFooter";

// CardTitle Component (from uppercase version)
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h4 ref={ref} className={cn("text-lg font-medium", className)} {...props}>
      {children}
    </h4>
  )
);
CardTitle.displayName = "CardTitle";

// Set up compound component pattern
interface CompoundCard
  extends React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>> {
  Header: typeof CardHeader;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
  Title: typeof CardTitle;
}

// Add components to Card
(Card as CompoundCard).Header = CardHeader;
(Card as CompoundCard).Content = CardContent;
(Card as CompoundCard).Footer = CardFooter;
(Card as CompoundCard).Title = CardTitle;

// Export all components
export { Card, CardHeader, CardContent, CardFooter, CardTitle };

// Default export for backward compatibility
export default Card as CompoundCard;
```

2. **Re-export File**:

```tsx
// src/components/ui/Card.tsx
import { Card as CardComponent, CardHeader, CardContent, CardFooter, CardTitle } from "./card";

// Re-export for backward compatibility
export const Card = CardComponent;
export { CardHeader, CardContent, CardFooter, CardTitle };
export default Card;
```

### Benefits of This Approach

1. **Best of Both Worlds**: Combines the forwardRef usage from lowercase with the compound component pattern from uppercase
2. **Flexible API**: Supports both composition styles (children-based and props-based)
3. **Complete Feature Set**: Includes all components and props from both implementations
4. **Type Safety**: Maintains strong TypeScript typing throughout
5. **Backward Compatibility**: Preserves both API styles to avoid breaking existing code
6. **Enhanced Developer Experience**: The combined component is more versatile for future use

This consolidation demonstrates how to handle components with different architectural approaches while preserving all functionality and ensuring backward compatibility. The result is a more robust and versatile component that provides multiple ways to achieve the same outcome, catering to different developer preferences and use cases.

## Cross-Directory Consolidation Example: Wialon Unit List Components

The Wialon unit list components represent a different consolidation challenge - similar components spread across different directories with one significantly more advanced:

### Current State

1. **src/components/Map/wialon/WialonUnitList.tsx** (singular)
   - Simple component that renders a basic list of Wialon units
   - Minimal styling with just a heading and unordered list
   - Shows unit name and position information
   - Basic loading/error states
   - Has both named and default exports
   - Includes a comment explaining its functionality

2. **src/hooks/WialonUnitList.tsx** (also singular)
   - Almost identical to the first component
   - Same basic functionality and UI
   - Missing the default export and explanatory comment
   - Incorrectly placed in the hooks directory despite being a component

3. **src/components/Map/wialon/WialonUnitsList.tsx** (plural)
   - Significantly more advanced implementation
   - Features sophisticated filtering, sorting, and search functionality
   - Renders units in a styled table with detailed information
   - Includes online/offline status indicators with color coding
   - Shows last active timestamps
   - Type filtering with auto-generated dropdown
   - Click handlers for unit selection
   - Count of displayed units
   - Responsive Tailwind CSS styling

### Consolidation Strategy

1. **Enhanced Primary Implementation**:
   - Keep the advanced `WialonUnitsList.tsx` (plural) as the primary component
   - Add a "mode" prop to allow rendering in the simpler style when needed
   - Implement responsive design that works in all contexts

2. **Code Organization**:
   - Keep the component in the Map/wialon directory where it's most relevant
   - Remove the incorrectly placed component from the hooks directory

3. **Backward Compatibility**:
   - Create re-exports for both singular versions pointing to the enhanced component

### Implementation Plan

1. **Enhanced Primary Component**:

```tsx
// src/components/Map/wialon/WialonUnitsList.tsx
import React, { useState, useEffect } from "react";
import { useWialonUnits, WialonUnitData } from "../../../hooks/useWialonUnits";

// Extended Wialon unit interface with additional properties
interface ExtendedWialonUnit extends WialonUnitData {
  cls_id?: number;
  type?: string;
  hw_id?: string;
  last_message?: number;
  connection_state?: number;
  [key: string]: any;
}

interface WialonUnitsListProps {
  /** Mode to display the list in (simple or detailed) */
  mode?: "simple" | "detailed";
  /** Optional filter for units by name */
  nameFilter?: string;
  /** Optional filter for units by type/class */
  typeFilter?: string;
  /** Optional max units to display */
  limit?: number;
  /** Callback when a unit is selected */
  onSelectUnit?: (unitId: number, unitInfo: ExtendedWialonUnit) => void;
}

/**
 * WialonUnitsList Component
 *
 * Displays a list of Wialon units with filtering options.
 * Can be rendered in simple or detailed mode.
 */
const WialonUnitsList: React.FC<WialonUnitsListProps> = ({
  mode = "detailed",
  nameFilter = "",
  typeFilter = "",
  limit,
  onSelectUnit,
}) => {
  const [searchQuery, setSearchQuery] = useState(nameFilter);
  const [selectedType, setSelectedType] = useState(typeFilter);
  const { units, loading, error } = useWialonUnits();
  const [filteredUnits, setFilteredUnits] = useState<ExtendedWialonUnit[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  }>({
    key: "name",
    direction: "ascending",
  });

  // Filtering and sorting logic
  useEffect(() => {
    // ... (existing implementation)
  }, [units, searchQuery, selectedType, sortConfig, limit]);

  // Loading and error states (consistent for both modes)
  if (loading) {
    return (
      <div className={mode === "simple" ? "" : "p-4 text-center"}>
        <div className={mode === "simple" ? "" : "animate-pulse"}>Loading Wialon units...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={mode === "simple" ? "" : "p-4 text-center text-red-600"}>
        <p className={mode === "simple" ? "text-red-600" : "font-medium"}>Error loading units</p>
        <p className={mode === "simple" ? "" : "text-sm mt-1"}>{String(error)}</p>
      </div>
    );
  }

  if (!units || units.length === 0) {
    return (
      <div className={mode === "simple" ? "" : "p-4 text-center text-gray-600"}>
        No units available. Please check your Wialon connection.
      </div>
    );
  }

  // Simple mode rendering (compatible with original WialonUnitList)
  if (mode === "simple") {
    return (
      <div>
        <h2>Wialon Units</h2>
        <ul>
          {filteredUnits.map((u) => (
            <li
              key={u.id}
              onClick={() => onSelectUnit && onSelectUnit(u.id, u)}
              style={{ cursor: onSelectUnit ? "pointer" : "default" }}
            >
              {u.name}
              {u.pos && (
                <>
                  {" — "}
                  X: {u.pos.x}, Y: {u.pos.y}, Speed: {u.pos.s}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Detailed mode rendering (the original sophisticated view)
  return (
    <div className="wialon-units-list">
      {/* Filtering UI */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        {/* ... (existing implementation) */}
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">{/* ... (existing implementation) */}</div>

      {/* Unit count */}
      <div className="mt-2 text-right text-sm text-gray-500">
        {filteredUnits.length} units shown{" "}
        {units.length > filteredUnits.length && `(out of ${units.length})`}
      </div>
    </div>
  );
};

export default WialonUnitsList;
```

2. **Re-export Files**:

```tsx
// src/components/Map/wialon/WialonUnitList.tsx
import WialonUnitsList from "./WialonUnitsList";

/**
 * This is the simple version of the Wialon Unit List component.
 * It renders a basic list of units with minimal styling.
 */
export const WialonUnitList = (props) => <WialonUnitsList mode="simple" {...props} />;

export default WialonUnitList;
```

```tsx
// src/hooks/WialonUnitList.tsx
import { WialonUnitList as WialonUnitListComponent } from "../components/Map/wialon/WialonUnitList";

/**
 * This component should be imported from the components directory.
 * This file exists for backward compatibility.
 */
export const WialonUnitList = WialonUnitListComponent;
```

### Benefits of This Approach

1. **Code Deduplication**: Eliminates identical code spread across multiple files
2. **Feature Consolidation**: All capabilities available in one component with mode switching
3. **Proper Organization**: Components properly located in the component directory
4. **Enhanced Functionality**: Simple version gains selection capabilities from advanced version
5. **Consistent UI**: Loading and error states are standardized across both modes
6. **Improved Maintainability**: Single source of truth for Wialon unit list display
7. **Full Backward Compatibility**: All existing imports continue to work without changes

This approach demonstrates how to handle similar components spread across different directories while preserving all functionality and eliminating duplication.
