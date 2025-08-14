import { cn } from "@/utils/cn";
import React from "react";

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
