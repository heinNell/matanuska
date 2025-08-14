import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

/* ----------------------------------
 * ✅ Input Component
 * A reusable input field with label and error display.
 * ---------------------------------- */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  error?: string | false;
}

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => (
  <div className="mb-4">
    {/* Label for the input field, with a required indicator if needed */}
    <label className="block font-medium mb-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    {/* Input element with dynamic styling based on error or disabled state */}
    <input
      {...props}
      className={`w-full border rounded px-3 py-2 focus:ring focus:outline-none ${
        error ? "border-red-500" : ""
      } ${props.disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${props.className || ""}`}
    />
    {/* Display error message if present */}
    {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
  </div>
);

/* ----------------------------------
 * ✅ Select Component
 * A reusable select dropdown with label, options, and error display.
 * ---------------------------------- */
interface SelectOption {
  value: string;
  label: React.ReactNode;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: React.ReactNode;
  options: SelectOption[];
  error?: string | false;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, ...props }) => (
  <div className="mb-4">
    {/* Label for the select field, with a required indicator if needed */}
    <label className="block font-medium mb-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    {/* Select element with dynamic styling based on error or disabled state */}
    <select
      {...props}
      className={`w-full border rounded px-3 py-2 focus:ring focus:outline-none ${
        error ? "border-red-500" : ""
      } ${props.disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${props.className || ""}`}
    >
      {/* Map through options to create individual <option> elements */}
      {options.map((option, idx) => (
        <option key={idx} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {/* Display error message if present */}
    {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
  </div>
);

/* ----------------------------------
 * ✅ TextArea Component
 * A reusable textarea field with optional label and error display.
 * ---------------------------------- */
interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: string | false;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, ...props }) => (
  <div className="flex flex-col mb-4">
    {/* Optional label for the textarea, with a required indicator if needed */}
    {label && (
      <label className="mb-1 font-medium">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
    )}
    {/* Textarea element with dynamic styling based on error or disabled state */}
    <textarea
      {...props}
      className={`border rounded p-2 focus:ring ${
        error ? "border-red-500" : ""
      } ${props.disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${props.className || ""}`}
    />
    {/* Display error message if present */}
    {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
  </div>
);

// Alias export to support both TextArea and Textarea naming
export const Textarea = TextArea;

/* ----------------------------------
 * ✅ File Upload Component
 * A reusable file input with label and error display, and a file selection callback.
 * ---------------------------------- */
interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  onFileSelect: (files: FileList | null) => void;
  error?: string | false;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, onFileSelect, error, ...props }) => (
  <div className="flex flex-col mb-4">
    {/* Optional label for the file input */}
    {label && <label className="mb-1 font-medium">{label}</label>}
    {/* File input element with custom styling for the file button */}
    <input
      {...props}
      type="file"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFileSelect(e.target.files)}
      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
        file:rounded-md file:border-0 file:text-sm file:font-medium
        file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
        file:cursor-pointer cursor-pointer"
    />
    {/* Display error message if present */}
    {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
  </div>
);

// Export all components as a default object for convenience
export default { Input, Select, TextArea, Textarea, FileUpload };
