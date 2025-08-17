import React, { useEffect, useState } from "react";
import {
  DriverData,
  useBloodTypes,
  useCountries,
  useDriverLicenseCategories,
  useDriverStatusOptions,
  useLicenseStatusOptions,
} from "../../../hooks/useDriverFormData";

// Icons
import { AlertCircle, Save, User, X } from "lucide-react";

// Components
import { Button } from "../../../components/ui/Button";
import useOfflineForm from "../../../hooks/useOfflineForm";
import Card, { CardContent, CardHeader } from "../../ui/Card";

interface DriverFormProps {
  onSubmit?: (data: DriverData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<DriverData>;
  driverId?: string;
  isModal?: boolean;
}

const defaultEmergencyContact = {
  name: "",
  relationship: "",
  phone: "",
};

const defaultMedicalInfo = {
  conditions: "",
  bloodType: "",
  allergies: "",
};

const defaultLicenseInfo = {
  number: "",
  expiry: "",
  categories: [],
  country: "South Africa",
  status: "valid" as const,
};

const defaultFormData: DriverData = {
  firstName: "",
  lastName: "",
  idNumber: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "South Africa",
  employeeNumber: "",
  licenseInfo: defaultLicenseInfo,
  dateHired: new Date().toISOString().split("T")[0],
  status: "active",
  emergencyContact: defaultEmergencyContact,
  medicalInfo: defaultMedicalInfo,
};

const DriverForm: React.FC<DriverFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  driverId,
  isModal = false,
}) => {
  // Get data from hooks
  const { categories, loading: categoriesLoading } = useDriverLicenseCategories();
  const { countries, loading: countriesLoading } = useCountries();
  const statusOptions = useDriverStatusOptions();
  const licenseStatusOptions = useLicenseStatusOptions();
  const bloodTypes = useBloodTypes();

  // Form state
  const [formData, setFormData] = useState<DriverData>({
    ...defaultFormData,
    ...initialData,
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Offline form handling
  const { submit, isSubmitting, isOfflineOperation } = useOfflineForm({
    collectionPath: "drivers",
    showOfflineWarning: true,
    onSuccess: () => {
      if (onCancel) onCancel();
    },
  });

  // Calculate age based on ID number (South African format)
  useEffect(() => {
    if (formData.idNumber && formData.idNumber.length === 13) {
      try {
        // Extract birth date from ID number (YYMMDD)
        const yearPart = formData.idNumber.substring(0, 2);
        const monthPart = formData.idNumber.substring(2, 4);
        const dayPart = formData.idNumber.substring(4, 6);

        // Determine century
        const currentYear = new Date().getFullYear();
        const century = parseInt(yearPart) > currentYear % 100 ? "19" : "20";

        const birthDate = `${century}${yearPart}-${monthPart}-${dayPart}`;

        if (isValidDate(birthDate)) {
          setFormData((prev) => ({
            ...prev,
            dateOfBirth: birthDate,
          }));
        }
      } catch (error) {
        console.error("Error parsing ID number:", error);
      }
    }
  }, [formData.idNumber]);

  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle nested fields
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => {
        const parentObj = (prev[parent as keyof DriverData] as Record<string, any>) || {};

        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value,
          },
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    // Handle license categories checkbox
    setFormData((prev) => {
      const currentCategories = [...(prev.licenseInfo.categories || [])];

      if (checked) {
        // Add category if checked
        if (!currentCategories.includes(value)) {
          currentCategories.push(value);
        }
      } else {
        // Remove category if unchecked
        const index = currentCategories.indexOf(value);
        if (index !== -1) {
          currentCategories.splice(index, 1);
        }
      }

      return {
        ...prev,
        licenseInfo: {
          ...prev.licenseInfo,
          categories: currentCategories,
        },
      };
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.idNumber) newErrors.idNumber = "ID number is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.employeeNumber) newErrors.employeeNumber = "Employee number is required";

    // License validation
    if (!formData.licenseInfo.number)
      newErrors["licenseInfo.number"] = "License number is required";
    if (!formData.licenseInfo.expiry) newErrors["licenseInfo.expiry"] = "Expiry date is required";
    if (formData.licenseInfo.categories.length === 0)
      newErrors["licenseInfo.categories"] = "At least one category is required";

    // Check if license is expired
    const expiryDate = new Date(formData.licenseInfo.expiry);
    const today = new Date();
    if (expiryDate < today) {
      newErrors["licenseInfo.expiry"] = "License has expired";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      // Use the passed submit handler or the default offline form submit
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        await submit(formData, driverId);
      }
    } catch (error) {
      console.error("Error submitting driver data:", error);
    }
  };

  const isLoading = categoriesLoading || countriesLoading || isSubmitting;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <div>
        <h3 className="font-medium text-lg mb-4">Personal Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-1">
              First Name *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.firstName ? "border-red-500" : "border-gray-300"} rounded-md`}
              disabled={isLoading}
              required
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
              Last Name *
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.lastName ? "border-red-500" : "border-gray-300"} rounded-md`}
              disabled={isLoading}
              required
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <label htmlFor="idNumber" className="block text-sm font-medium mb-1">
              ID Number *
            </label>
            <input
              id="idNumber"
              name="idNumber"
              type="text"
              value={formData.idNumber}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.idNumber ? "border-red-500" : "border-gray-300"} rounded-md`}
              disabled={isLoading}
              required
              maxLength={13}
              minLength={13}
            />
            {errors.idNumber && <p className="text-red-500 text-sm mt-1">{errors.idNumber}</p>}
            <p className="text-xs text-gray-500 mt-1">South African ID (13 digits)</p>
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">Auto-filled from ID number if valid</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.phone ? "border-red-500" : "border-gray-300"} rounded-md`}
              disabled={isLoading}
              required
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div>
        <h3 className="font-medium text-lg mb-4">Address</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-1">
              Country
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading || countriesLoading}
            >
              {countries.map((country, index) => (
                <option key={index} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div>
        <h3 className="font-medium text-lg mb-4">Employment Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="employeeNumber" className="block text-sm font-medium mb-1">
              Employee Number *
            </label>
            <input
              id="employeeNumber"
              name="employeeNumber"
              type="text"
              value={formData.employeeNumber}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.employeeNumber ? "border-red-500" : "border-gray-300"} rounded-md`}
              disabled={isLoading}
              required
            />
            {errors.employeeNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.employeeNumber}</p>
            )}
          </div>

          <div>
            <label htmlFor="dateHired" className="block text-sm font-medium mb-1">
              Date Hired
            </label>
            <input
              id="dateHired"
              name="dateHired"
              type="date"
              value={formData.dateHired}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Driver's License Information */}
      <div>
        <h3 className="font-medium text-lg mb-4">Driver's License Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="licenseInfo.number" className="block text-sm font-medium mb-1">
              License Number *
            </label>
            <input
              id="licenseInfo.number"
              name="licenseInfo.number"
              type="text"
              value={formData.licenseInfo.number}
              onChange={handleChange}
              className={`w-full p-2 border ${errors["licenseInfo.number"] ? "border-red-500" : "border-gray-300"} rounded-md`}
              disabled={isLoading}
              required
            />
            {errors["licenseInfo.number"] && (
              <p className="text-red-500 text-sm mt-1">{errors["licenseInfo.number"]}</p>
            )}
          </div>

          <div>
            <label htmlFor="licenseInfo.expiry" className="block text-sm font-medium mb-1">
              Expiry Date *
            </label>
            <input
              id="licenseInfo.expiry"
              name="licenseInfo.expiry"
              type="date"
              value={formData.licenseInfo.expiry}
              onChange={handleChange}
              className={`w-full p-2 border ${errors["licenseInfo.expiry"] ? "border-red-500" : "border-gray-300"} rounded-md`}
              disabled={isLoading}
              required
            />
            {errors["licenseInfo.expiry"] && (
              <p className="text-red-500 text-sm mt-1">{errors["licenseInfo.expiry"]}</p>
            )}
          </div>

          <div>
            <label htmlFor="licenseInfo.country" className="block text-sm font-medium mb-1">
              Issuing Country
            </label>
            <select
              id="licenseInfo.country"
              name="licenseInfo.country"
              value={formData.licenseInfo.country}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading || countriesLoading}
            >
              {countries.map((country, index) => (
                <option key={index} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="licenseInfo.status" className="block text-sm font-medium mb-1">
              License Status
            </label>
            <select
              id="licenseInfo.status"
              name="licenseInfo.status"
              value={formData.licenseInfo.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            >
              {licenseStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">License Categories *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {categoriesLoading ? (
                <div className="text-sm text-gray-500">Loading categories...</div>
              ) : (
                categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="licenseInfo.categories"
                      value={category.code}
                      checked={formData.licenseInfo.categories.includes(category.code)}
                      onChange={handleCheckboxChange}
                      className="rounded text-blue-600"
                      disabled={isLoading}
                    />
                    <span className="text-sm">
                      {category.code} - {category.description}
                    </span>
                  </label>
                ))
              )}
            </div>
            {errors["licenseInfo.categories"] && (
              <p className="text-red-500 text-sm mt-1">{errors["licenseInfo.categories"]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className="font-medium text-lg mb-4">Emergency Contact</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="emergencyContact.name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              id="emergencyContact.name"
              name="emergencyContact.name"
              type="text"
              value={formData.emergencyContact?.name || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="emergencyContact.relationship"
              className="block text-sm font-medium mb-1"
            >
              Relationship
            </label>
            <input
              id="emergencyContact.relationship"
              name="emergencyContact.relationship"
              type="text"
              value={formData.emergencyContact?.relationship || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="emergencyContact.phone" className="block text-sm font-medium mb-1">
              Phone
            </label>
            <input
              id="emergencyContact.phone"
              name="emergencyContact.phone"
              type="tel"
              value={formData.emergencyContact?.phone || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div>
        <h3 className="font-medium text-lg mb-4">Medical Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="medicalInfo.conditions" className="block text-sm font-medium mb-1">
              Medical Conditions
            </label>
            <textarea
              id="medicalInfo.conditions"
              name="medicalInfo.conditions"
              value={formData.medicalInfo?.conditions || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
              rows={3}
              placeholder="List any medical conditions that might be relevant in case of emergency"
            />
          </div>

          <div>
            <label htmlFor="medicalInfo.bloodType" className="block text-sm font-medium mb-1">
              Blood Type
            </label>
            <select
              id="medicalInfo.bloodType"
              name="medicalInfo.bloodType"
              value={formData.medicalInfo?.bloodType || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            >
              <option value="">Select Blood Type</option>
              {bloodTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="medicalInfo.allergies" className="block text-sm font-medium mb-1">
              Allergies
            </label>
            <input
              id="medicalInfo.allergies"
              name="medicalInfo.allergies"
              type="text"
              value={formData.medicalInfo?.allergies || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isLoading}
              placeholder="Medications, foods, etc."
            />
          </div>
        </div>
      </div>

      {/* Offline Warning */}
      {isOfflineOperation && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <div className="text-yellow-700">
              <p className="text-sm">
                You're currently offline. This form will be submitted when you reconnect to the
                internet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex items-center gap-1"
          disabled={isLoading}
        >
          <X size={16} />
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          <Save size={16} />
          {isLoading ? "Saving..." : driverId ? "Update Driver" : "Create Driver"}
        </Button>
      </div>
    </form>
  );

  return isModal ? (
    formContent
  ) : (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User size={20} className="text-blue-500" />
          <h2 className="text-xl font-semibold">{driverId ? "Edit Driver" : "Add New Driver"}</h2>
        </div>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
};

export default DriverForm;
