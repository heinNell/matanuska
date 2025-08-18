import { saveAs } from 'file-saver';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import {
  AlertCircle,
  ArrowLeft,
  CameraIcon,
  FileDown,
  Save
} from 'lucide-react';
import React, { useState } from 'react';
// Remove unused import
// import { useNavigate } from 'react-router-dom';
import { DriverLicense } from '../../../hooks/useDriverFormData';
import useOfflineForm from '../../../hooks/useOfflineForm';
import { DriverData, EmergencyContact, MedicalInfo } from '../../../types/Details';

interface LicenseCategory {
  id: string;
  code: string;
  description: string;
}

interface Country {
  code: string;
  name: string;
}

// Mock hooks (replace with your actual hooks)
const useDriverLicenseCategories = () => {
  const categories: LicenseCategory[] = [
    { id: '1', code: 'B', description: 'Light Motor Vehicle' },
    { id: '2', code: 'C1', description: 'Medium Motor Vehicle' },
    { id: '3', code: 'EC', description: 'Heavy Motor Vehicle' },
  ];
  return { categories, loading: false };
};

const useCountries = () => {
  const countries: Country[] = [
    { code: 'ZA', name: 'South Africa' },
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
  ];
  return { countries, loading: false };
};

const useDriverStatusOptions = () => {
  return [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on_leave', label: 'On Leave' },
    { value: 'terminated', label: 'Terminated' },
  ];
};

const useLicenseStatusOptions = () => {
  return [
    { value: 'valid', label: 'Valid' },
    { value: 'expired', label: 'Expired' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'revoked', label: 'Revoked' },
  ];
};

const useBloodTypes = () => {
  return ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
};

// Mock UI components (replace with your actual UI components)
interface CardProps { children: React.ReactNode; className?: string; }
const Card: React.FC<CardProps> = ({ children, className }) => <div className={`bg-white shadow rounded-lg ${className}`}>{children}</div>;

interface CardHeaderProps { children: React.ReactNode; }
const CardHeader: React.FC<CardHeaderProps> = ({ children }) => <div className="px-6 py-4 border-b border-gray-200">{children}</div>;

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "outline" | "danger";
  disabled?: boolean;
  className?: string;
}
const Button: React.FC<ButtonProps> = ({ children, onClick, type = "button", variant = "primary", disabled = false, className = "" }) => {
  let baseStyle = "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  switch (variant) {
    case "outline": baseStyle += " bg-white text-gray-700 border-gray-300 hover:bg-gray-50"; break;
    case "danger": baseStyle += " bg-red-600 text-white hover:bg-red-700"; break;
    default: baseStyle += " bg-indigo-600 text-white hover:bg-indigo-700"; break;
  }
  return <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${className}`}>{children}</button>;
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
const Input: React.FC<InputProps> = ({ label, error, id, name, ...props }) => (
  <div>
    {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>}
    <input id={id} name={name} {...props} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}
const Select: React.FC<SelectProps> = ({ label, options, error, id, name, ...props }) => (
  <div>
    {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>}
    <select id={id} name={name} {...props} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
const Checkbox: React.FC<CheckboxProps> = ({ label, id, name, ...props }) => (
  <input id={id} name={name} type="checkbox" {...props} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
const TextArea: React.FC<TextAreaProps> = ({ label, error, id, name, ...props }) => (
  <div>
    {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>}
    <textarea id={id} name={name} {...props} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}
const Label: React.FC<LabelProps> = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
);


// Helper function for PDF generation
const generatePDF = (driverData: DriverData) => {
  console.log('Generating PDF for:', driverData);

  const content = `
    Driver Profile
    ================

    Personal Information
    --------------------
    Name: ${driverData.firstName} ${driverData.lastName}
    ID Number: ${driverData.idNumber}
    Email: ${driverData.email || 'Not provided'}
    Phone: ${driverData.phone}
    Date of Birth: ${driverData.dateOfBirth || 'Not provided'}
    Address: ${driverData.address || 'Not provided'}, ${driverData.city || ''}, ${driverData.country || ''}

    Employment Information
    ---------------------
    Employee Number: ${driverData.employeeNumber}
    Date Hired: ${driverData.dateHired}
    Status: ${driverData.status}

    License Information
    ------------------
    License Number: ${driverData.licenseInfo.number}
    License Expiry: ${driverData.licenseInfo.expiry}
    Categories: ${driverData.licenseInfo.categories.join(', ')}
    License Status: ${driverData.licenseInfo.status}

    Emergency Contact
    ---------------
    Name: ${driverData.emergencyContact?.name || 'Not provided'}
    Relationship: ${driverData.emergencyContact?.relationship || 'Not provided'}
    Phone: ${driverData.emergencyContact?.phone || 'Not provided'}

    Medical Information
    -----------------
    Conditions: ${driverData.medicalInfo?.conditions || 'None'}
    Blood Type: ${driverData.medicalInfo?.bloodType || 'Not provided'}
    Allergies: ${driverData.medicalInfo?.allergies || 'None'}
  `;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `driver_${driverData.lastName}_${driverData.firstName}.pdf`);
};

interface EnhancedDriverFormProps {
  onSubmit?: (data: DriverData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<DriverData>;
  driverId?: string;
  isModal?: boolean;
  isEditMode?: boolean;
}

const defaultEmergencyContact: EmergencyContact = {
  name: "",
  relationship: "",
  phone: "",
};

const defaultMedicalInfo: MedicalInfo = {
  conditions: "",
  bloodType: "",
  allergies: "",
};

const defaultLicenseInfo: DriverLicense = {
  number: "",
  expiry: "",
  categories: [],
  country: "South Africa",
  status: "valid",
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
  // Ensure dateHired is always a string by providing default value
  dateHired: new Date().toISOString().split("T")[0] as string,
  status: "active",
  emergencyContact: defaultEmergencyContact,
  medicalInfo: defaultMedicalInfo,
} as const;

const EnhancedDriverForm: React.FC<EnhancedDriverFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  driverId,
  isModal = false,
  isEditMode = false
}) => {
  // Remove unused navigate
  // const navigate = useNavigate();

  // Get data from hooks
  const { categories, loading: categoriesLoading } = useDriverLicenseCategories();
  const { countries, loading: countriesLoading } = useCountries();
  const statusOptions = useDriverStatusOptions();
  const licenseStatusOptions = useLicenseStatusOptions();
  const bloodTypes = useBloodTypes();

  // Form state
  const [formData, setFormData] = useState<DriverData>(() => {
    const { dateHired: initialDateHired, ...restInitialData } = initialData || {};
    return {
      ...defaultFormData,
      ...restInitialData,
      // Ensure dateHired is always a string
      dateHired: initialDateHired || defaultFormData.dateHired,
    };
  });

  // File uploads state
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [defensiveDrivingPermitFile, setDefensiveDrivingPermitFile] = useState<File | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  // Remove unused uploadProgress state
  // const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

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
  // Removed for brevity...

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle nested fields
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev: DriverData) => ({
        ...prev,
        [parent as keyof DriverData]: {
          ...((prev[parent as keyof DriverData] as Record<string, unknown>) ?? {}),
          [child as string]: value,
        },
      }));
    } else {
      setFormData((prev: DriverData) => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    // Handle license categories checkbox
    setFormData((prev: DriverData) => { // Explicitly type prev
      const currentCategories = [...(prev.licenseInfo.categories || [])];

      if (checked) {
        if (!currentCategories.includes(value)) {
          currentCategories.push(value);
        }
      } else {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      switch(fileType) {
        case 'profile':
          setProfilePhotoFile(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              setProfilePhotoUrl(e.target.result as string);
            }
          };
          reader.readAsDataURL(file);
          break;
        case 'license':
          setLicenseFile(file);
          break;
        case 'passport':
          setPassportFile(file);
          break;
        case 'defensiveDriving':
          setDefensiveDrivingPermitFile(file);
          break;
      }
    }
  };

  const uploadFileToStorage = async (file: File, path: string): Promise<string> => {
    const storage = getStorage();
    const fileRef = ref(storage, `drivers/${driverId || 'new'}/${path}/${file.name}`);

    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
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
      // Upload any files first
      const enhancedFormData = { ...formData };

      if (profilePhotoFile) {
        const profilePhotoUrl = await uploadFileToStorage(profilePhotoFile, 'profilePhotos');
        enhancedFormData.profilePhotoUrl = profilePhotoUrl;
      }

      if (licenseFile) {
        const licenseFileUrl = await uploadFileToStorage(licenseFile, 'licenses');
        if (!enhancedFormData.documents) enhancedFormData.documents = {};
        enhancedFormData.documents.licenseFile = licenseFileUrl;
      }

      if (passportFile) {
        const passportFileUrl = await uploadFileToStorage(passportFile, 'idDocuments');
        if (!enhancedFormData.documents) enhancedFormData.documents = {};
        enhancedFormData.documents.passportFile = passportFileUrl;
      }

      if (defensiveDrivingPermitFile) {
        const defensiveDrivingUrl = await uploadFileToStorage(defensiveDrivingPermitFile, 'permits');
        if (!enhancedFormData.documents) enhancedFormData.documents = {};
        enhancedFormData.documents.defensiveDrivingPermit = defensiveDrivingUrl;
      }

      // Use the passed submit handler or the default offline form submit
      if (onSubmit) {
        await onSubmit(enhancedFormData);
      } else {
        await submit(enhancedFormData, driverId);
      }
    } catch (error) {
      console.error("Error submitting driver data:", error);
    }
  };

  const handleDownloadProfile = () => {
    generatePDF(formData);
  };

  const isLoading = categoriesLoading || countriesLoading || isSubmitting;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Photo */}
      {!isModal && (
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center space-x-4">
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <CameraIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="font-medium text-gray-900">Profile Photo</h2>
              <p className="text-sm text-gray-500">Upload a profile photo of the driver</p>
              <input
                id="profile-photo"
                type="file"
                className="mt-1 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'profile')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Personal Information Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              required
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
            />
          </div>

          <div>
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              id="idNumber"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              error={errors.idNumber}
              required
            />
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              required
            />
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Address Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Select
              id="country"
              name="country"
              value={formData.country || "South Africa"}
              onChange={handleChange}
              options={countries.map(country => ({ value: country.name, label: country.name }))} // Pass options prop
            >
              {countriesLoading && <option value="">Loading...</option>}
            </Select>
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Employment Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="employeeNumber">Employee Number</Label>
            <Input
              id="employeeNumber"
              name="employeeNumber"
              value={formData.employeeNumber}
              onChange={handleChange}
              error={errors.employeeNumber}
              required
            />
          </div>

          <div>
            <Label htmlFor="dateHired">Date Hired</Label>
            <Input
              type="date"
              id="dateHired"
              name="dateHired"
              value={formData.dateHired}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Employment Status</Label>
            <Select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              options={statusOptions} // Pass options prop
            />
          </div>
        </div>
      </div>

      {/* Driver's License Information */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Driver's License Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="licenseInfo.number">License Number</Label>
            <Input
              id="licenseInfo.number"
              name="licenseInfo.number"
              value={formData.licenseInfo.number}
              onChange={handleChange}
              error={errors["licenseInfo.number"]}
              required
            />
          </div>

          <div>
            <Label htmlFor="licenseInfo.expiry">License Expiry Date</Label>
            <Input
              type="date"
              id="licenseInfo.expiry"
              name="licenseInfo.expiry"
              value={formData.licenseInfo.expiry}
              onChange={handleChange}
              error={errors["licenseInfo.expiry"]}
              required
            />
          </div>

          <div>
            <Label htmlFor="licenseInfo.status">License Status</Label>
            <Select
              id="licenseInfo.status"
              name="licenseInfo.status"
              value={formData.licenseInfo.status}
              onChange={handleChange}
              required
              options={licenseStatusOptions} // Pass options prop
            />
          </div>

          <div>
            <Label htmlFor="licenseInfo.country">License Country</Label>
            <Select
              id="licenseInfo.country"
              name="licenseInfo.country"
              value={formData.licenseInfo.country}
              onChange={handleChange}
              required
              options={countries.map(country => ({ value: country.name, label: country.name }))} // Pass options prop
            >
              {countriesLoading && <option value="">Loading...</option>}
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label className="block mb-2">License Categories</Label>
            {categoriesLoading ? (
              <div className="text-sm text-gray-500">Loading categories...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <Checkbox
                      id={`category-${category.id}`}
                      name="licenseCategories"
                      value={category.code}
                      checked={formData.licenseInfo.categories.includes(category.code)}
                      onChange={handleCheckboxChange}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {category.code} - {category.description}
                    </label>
                  </div>
                ))}
              </div>
            )}
            {errors["licenseInfo.categories"] && (
              <p className="mt-1 text-sm text-red-600">{errors["licenseInfo.categories"]}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="licenseFile">Upload License Document</Label>
            <input
              id="licenseFile"
              type="file"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, 'license')}
            />
            {licenseFile && (
              <p className="mt-1 text-sm text-green-600">
                Selected file: {licenseFile.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergencyContact.name">Contact Name</Label>
            <Input
              id="emergencyContact.name"
              name="emergencyContact.name"
              value={formData.emergencyContact?.name || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="emergencyContact.relationship">Relationship</Label>
            <Input
              id="emergencyContact.relationship"
              name="emergencyContact.relationship"
              value={formData.emergencyContact?.relationship || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="emergencyContact.phone">Contact Phone</Label>
            <Input
              id="emergencyContact.phone"
              name="emergencyContact.phone"
              value={formData.emergencyContact?.phone || ""}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="medicalInfo.bloodType">Blood Type</Label>
            <Select
              id="medicalInfo.bloodType"
              name="medicalInfo.bloodType"
              value={formData.medicalInfo?.bloodType || ""}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Blood Type" },
                ...bloodTypes.map(type => ({ value: type, label: type }))
              ]} // Pass options prop
            />
          </div>

          <div>
            <Label htmlFor="medicalInfo.allergies">Allergies</Label>
            <Input
              id="medicalInfo.allergies"
              name="medicalInfo.allergies"
              value={formData.medicalInfo?.allergies || ""}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="medicalInfo.conditions">Medical Conditions</Label>
            <TextArea
              id="medicalInfo.conditions"
              name="medicalInfo.conditions"
              value={formData.medicalInfo?.conditions || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Additional Documents */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="passportFile">ID Document / Passport</Label>
            <input
              id="passportFile"
              type="file"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, 'passport')}
            />
            {passportFile && (
              <p className="mt-1 text-sm text-green-600">
                Selected file: {passportFile.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="defensiveDrivingPermitFile">Defensive Driving Permit</Label>
            <input
              id="defensiveDrivingPermitFile"
              type="file"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, 'defensiveDriving')}
            />
            {defensiveDrivingPermitFile && (
              <p className="mt-1 text-sm text-green-600">
                Selected file: {defensiveDrivingPermitFile.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Offline Warning */}
      {isOfflineOperation && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
            <p className="text-sm text-yellow-700">
              You are currently offline. This form will be saved and submitted once you reconnect to the internet.
            </p>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-between pt-4">
        <div>
          {!isModal && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadProfile}
              className="flex items-center gap-2"
              disabled={isSubmitting}
            >
              <FileDown className="h-4 w-4" />
              Download Profile
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting || isLoading}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? "Update Driver" : "Save Driver"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );

  return isModal ? (
    formContent
  ) : (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={onCancel}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">
              {driverId ? "Edit Driver" : "Add New Driver"}
            </h1>
            <p className="text-sm text-gray-500">
              {driverId
                ? "Update driver information and documents"
                : "Create a new driver profile with required details"}
            </p>
          </div>
        </div>
      </CardHeader>
      <div className="p-6">
        {formContent}
      </div>
    </Card>
  );
};

export default EnhancedDriverForm;
