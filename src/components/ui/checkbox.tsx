// src/components/ui/checkbox.tsx
import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  onCheckedChange,
  className = "",
  ...props
}) => {
  return (
    <label className="inline-flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        className={`form-checkbox h-5 w-5 rounded text-primary-600 border-gray-300 focus:ring-primary-500 focus:ring-2 ${className}`}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
};
