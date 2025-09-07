// src/components/forms/FormSelector.tsx
/**
 * FormSelector Component
 *
 * A reusable form select component that integrates with Firestore data sources.
 * This component handles loading states, errors, and provides a consistent UI
 * for all form selects throughout the application.
 */
import React from "react";
import { SelectOption, useFirestoreOptions } from "../../utils/formIntegration";

interface FormSelectorProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  collection: string;
  labelField?: string;
  valueField?: string;
  filterField?: string;
  filterValue?: any;
  sortField?: string;
  sortDirection?: "asc" | "desc";
  limitResults?: number;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  transform?: (item: any) => SelectOption;
}

const FormSelector: React.FC<FormSelectorProps> = ({
  label,
  name,
  value,
  onChange,
  collection,
  labelField,
  valueField,
  filterField,
  filterValue,
  sortField,
  sortDirection,
  limitResults,
  placeholder = "Select an option",
  required = false,
  error,
  disabled = false,
  className = "",
  transform,
}) => {
  const {
    options,
    loading,
    error: loadError,
    refresh,
  } = useFirestoreOptions({
    collection,
    labelField,
    valueField,
    filterField,
    filterValue,
    sortField,
    sortDirection,
    limitResults,
    transform,
  });

  return (
    <div className={`form-control w-full ${className}`}>
      <label htmlFor={name} className="label">
        <span className="label-text font-medium">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`select select-bordered w-full ${error || loadError ? "select-error" : ""}`}
          disabled={disabled || loading}
          aria-invalid={!!error}
          required={required}
        >
          <option value="" disabled>
            {loading ? "Loading options..." : placeholder}
          </option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="loading loading-spinner loading-sm" />
          </div>
        )}

        {!loading && options.length === 0 && !loadError && (
          <button
            type="button"
            onClick={refresh}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary"
            title="Refresh options"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </div>

      {(error || loadError) && (
        <div className="text-error text-xs mt-1">
          {error || (loadError ? "Failed to load options. Click refresh to try again." : "")}
        </div>
      )}

      {!loading && options.length === 0 && !loadError && (
        <div className="text-warning text-xs mt-1">No options available</div>
      )}
    </div>
  );
};

export default FormSelector;
