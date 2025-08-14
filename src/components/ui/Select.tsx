import React, { ChangeEvent } from 'react';

interface SelectOption {
  label: string;
  value: string;
}

interface BaseSelectProps {
  value: string;
  onValueChange?: (value: string) => void;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  label?: string;
  options?: SelectOption[]; // Gebruik dit as jy nie <Select.Item> gebruik nie
  children?: React.ReactNode; // Alternatief vir <Select.Item>
  className?: string;
}

const Select: React.FC<BaseSelectProps> & {
  Trigger: React.FC<{ children: React.ReactNode }>;
  Value: React.FC<{ placeholder: string }>;
  Content: React.FC<{ children: React.ReactNode }>;
  Item: React.FC<{ value: string; children: React.ReactNode }>;
} = ({ label, value, onValueChange, onChange, options, children, className }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    } else if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        value={value}
        onChange={handleChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
    </div>
  );
};

// Optional subcomponents (for API consistency if needed)
Select.Trigger = ({ children }) => <div>{children}</div>;
Select.Value = ({ placeholder }) => <div>{placeholder}</div>;
Select.Content = ({ children }) => <div>{children}</div>;
Select.Item = ({ value, children }) => <option value={value}>{children}</option>;

export default Select;
