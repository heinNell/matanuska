import { Controller, useFormContext } from "react-hook-form";
import ClientDropdown from "./ClientDropdown";

/**
 * FormClientDropdown - A wrapper around ClientDropdown for use with react-hook-form
 *
 * @param {Object} props - Component props
 * @param {string} props.name - Field name in the form
 * @param {string} props.label - Label text for the dropdown
 * @param {boolean} props.required - Whether selection is required
 * @param {string} props.placeholder - Placeholder text when no selection
 * @param {boolean} props.includeContact - Whether to show contact info in dropdown
 * @param {boolean} props.disabled - Whether the dropdown is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.rules - Validation rules for react-hook-form
 * @param {Object} props.options - Additional options for useClientDropdown
 */
const FormClientDropdown = ({
  name,
  label = "Client",
  required = false,
  placeholder = "Select a client",
  includeContact = false,
  disabled = false,
  className = "",
  rules = {},
  options = {},
  ...rest
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  // Add required rule if needed
  const validationRules = {
    ...rules,
    ...(required && !rules.required && { required: "This field is required" }),
  };

  return (
    <div className={className}>
      <Controller
        control={control}
        name={name}
        rules={validationRules}
        render={({ field }) => (
          <>
            <ClientDropdown
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              label={label}
              required={required}
              placeholder={placeholder}
              includeContact={includeContact}
              disabled={disabled}
              options={options}
              {...rest}
            />
            {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>}
          </>
        )}
      />
    </div>
  );
};

export default FormClientDropdown;
