import * as React from "react";
import { cn } from "../../../utils/cn";

/**
 * Card
 *
 * A versatile card component with various styling options and subcomponents.
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     Card Content
 *   </CardContent>
 *   <CardFooter>
 *     Card Footer
 *   </CardFooter>
 * </Card>
 * ```
 */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "simple"; // Add variant support for different styling
}

interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  heading?: React.ReactNode;      // Use heading instead of title
  title?: React.ReactNode;        // Added for backward compatibility
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
}

/**
 * Card component
 *
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @param props.variant - Card style variant: 'default' or 'simple'
 * @param props.children - Card content
 * @returns React component
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        variant === "default"
          ? "bg-white rounded-xl border shadow overflow-hidden"
          : "bg-white rounded-lg border shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

/**
 * CardHeader component
 *
 * @param props - Component props
 * @param props.heading - Card heading (preferred over title)
 * @param props.title - Card title (for backward compatibility)
 * @param props.subtitle - Card subtitle
 * @param props.icon - Icon to display next to the title
 * @param props.action - Action element to display in the header
 * @param props.className - Additional CSS classes
 * @param props.children - Additional header content
 * @returns React component
 */
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ heading, title, subtitle, icon, action, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-0.5 px-6 py-4 border-b border-slate-200", className)}
      {...props}
    >
      {(icon || heading || title || action) && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {icon && <span className="text-xl">{icon}</span>}
            {(title || heading) && (
              <h3 className="text-xl font-semibold text-slate-800">{title || heading}</h3>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {subtitle && (
        <div className="text-sm text-slate-500 mt-0.5">{subtitle}</div>
      )}
      {children}
    </div>
  )
);
CardHeader.displayName = "CardHeader";

/**
 * CardTitle component
 *
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @param props.children - Title content
 * @returns React component
 */
const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

/**
 * CardDescription component
 *
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @param props.children - Description content
 * @returns React component
 */
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

/**
 * CardContent component
 *
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @param props.children - Card content
 * @returns React component
 */
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = "CardContent";

/**
 * CardFooter component
 *
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @param props.children - Footer content
 * @returns React component
 */
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center", className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = "CardFooter";

/**
 * CardGrid component for responsive card layouts
 *
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @param props.columns - Responsive column configuration
 * @param props.gap - Gap between cards
 * @param props.children - Grid content (typically Card components)
 * @returns React component
 */
const CardGrid = React.forwardRef<HTMLDivElement, CardGridProps>(
  ({ className, children, columns = { sm: 1, md: 2, lg: 3 }, gap = "gap-4" }, ref) => {
    const gridCols = [
      columns.sm && `grid-cols-${columns.sm}`,
      columns.md && `md:grid-cols-${columns.md}`,
      columns.lg && `lg:grid-cols-${columns.lg}`,
      columns.xl && `xl:grid-cols-${columns.xl}`,
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={cn(`grid ${gridCols} ${gap}`, className)}
      >
        {children}
      </div>
    );
  }
);
CardGrid.displayName = "CardGrid";

// Export all card components
export {
  Card, CardContent, CardDescription, CardFooter,
  CardGrid, CardHeader,
  CardTitle
};

// Export default for backward compatibility
export default Card;
