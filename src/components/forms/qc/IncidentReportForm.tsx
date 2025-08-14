import { AlertTriangle, Calendar, Cloud, Map, Save, Truck, Upload } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "../../ui/Card";

interface IncidentReportFormProps {
  onSubmit?: (data: IncidentFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<IncidentFormData>;
}

interface IncidentFormData {
  incidentNumber: string;
  vehicleNumber: string;
  vin: string;
  vehicleName: string;
  date: string;
  time: string;
  location: string;
  incidentType: string;
  incidentArea: string;
  weatherCondition: string;
  severityRating: "Low" | "Medium" | "High" | "Critical";
  vehicleActivity: string;
  description: string;
  damageDescription: string;
  reportedBy: string;
  images: File[];
  imageUrls?: string[]; // For displaying previously uploaded images
}

const IncidentReportForm: React.FC<IncidentReportFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  // Generate a random incident number if not provided
  const generateIncidentNumber = () => {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `INC-${dateStr}-${randomNum}`;
  };

  const [formData, setFormData] = useState<IncidentFormData>({
    incidentNumber: initialData?.incidentNumber || generateIncidentNumber(),
    vehicleNumber: initialData?.vehicleNumber || "",
    vin: initialData?.vin || "",
    vehicleName: initialData?.vehicleName || "",
    date: initialData?.date || new Date().toISOString().split("T")[0],
    time: initialData?.time || new Date().toTimeString().slice(0, 5),
    location: initialData?.location || "",
    incidentType: initialData?.incidentType || "",
    incidentArea: initialData?.incidentArea || "",
    weatherCondition: initialData?.weatherCondition || "",
    severityRating: initialData?.severityRating || "Medium",
    vehicleActivity: initialData?.vehicleActivity || "",
    description: initialData?.description || "",
    damageDescription: initialData?.damageDescription || "",
    reportedBy: initialData?.reportedBy || "",
    images: [],
    imageUrls: initialData?.imageUrls || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof IncidentFormData, string>>
  >({});

  const incidentTypes = [
    "Collision",
    "Roll-Over",
    "Fire",
    "Theft",
    "Vandalism",
    "Natural Disaster",
    "Mechanical Failure",
    "Other",
  ];

  const weatherConditions = [
    "Clear",
    "Cloudy",
    "Rain",
    "Heavy Rain",
    "Fog",
    "Snow",
    "Ice",
    "Wind",
    "Storm",
    "Other",
  ];

  const activityTypes = [
    "Loading",
    "Unloading",
    "In Transit",
    "Parking",
    "Maintenance",
    "Idle",
    "Other",
  ];

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear validation error when field is edited
    if (validationErrors[name as keyof IncidentFormData]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const maxImages = 6;

    if (formData.images.length + files.length > maxImages) {
      alert(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));

    // Reset the input value so the same file can be selected again
    e.target.value = "";
  };

  // Remove an uploaded image
  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Remove a previously uploaded image
  const removePreviousImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls?.filter((_, i) => i !== index),
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof IncidentFormData, string>> = {};

    if (!formData.vehicleNumber) errors.vehicleNumber = "Vehicle number is required";
    if (!formData.date) errors.date = "Date is required";
    if (!formData.time) errors.time = "Time is required";
    if (!formData.location) errors.location = "Location is required";
    if (!formData.incidentType) errors.incidentType = "Incident type is required";
    if (!formData.description) errors.description = "Description is required";
    if (!formData.reportedBy) errors.reportedBy = "Reporter name is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      if (onSubmit) {
        onSubmit(formData);
      }
      setIsSubmitting(false);
    }, 1000);
  };

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const target = e.currentTarget;

    // Check if this is for removing a previously uploaded image
    if (target.closest("[key^='prev-']")) {
      const index = parseInt(target.closest("div")?.getAttribute("key")?.split("-")[1] || "0");
      removePreviousImage(index);
    }
    // For removing a newly uploaded image
    else if (target.closest("[key]")) {
      const index = parseInt(target.closest("div")?.getAttribute("key") || "0");
      removeImage(index);
    }
    // For cancel button
    else if (onCancel) {
      onCancel();
    }
  };
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
            Incident Report Form
          </h2>
          <div className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            Report #: {formData.incidentNumber}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="vehicleNumber"
              >
                Vehicle Number <span className="text-red-500">*</span>
              </label>
              <select
                id="vehicleNumber"
                name="vehicleNumber"
                className={`w-full px-3 py-2 border ${validationErrors.vehicleNumber ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Vehicle</option>
                <option value="MAT001">MAT001 - Volvo FH16</option>
                <option value="MAT002">MAT002 - Mercedes Actros</option>
                <option value="MAT003">MAT003 - Scania R450</option>
                <option value="MAT004">MAT004 - MAN TGX</option>
                <option value="MAT005">MAT005 - DAF XF</option>
              </select>
              {validationErrors.vehicleNumber && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.vehicleNumber}</p>
              )}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    id="date"
                    name="date"
                    className={`w-full pl-10 pr-3 py-2 border ${validationErrors.date ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {validationErrors.date && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.date}</p>
                )}
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="time">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  className={`w-full px-3 py-2 border ${validationErrors.time ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
                {validationErrors.time && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.time}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="vin">
                VIN
              </label>
              <div className="relative">
                <Truck className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  id="vin"
                  name="vin"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Vehicle Identification Number"
                  value={formData.vin}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="vehicleName">
                Vehicle Name
              </label>
              <input
                type="text"
                id="vehicleName"
                name="vehicleName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Road Runner 1"
                value={formData.vehicleName}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Map className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  className={`w-full pl-10 pr-3 py-2 border ${validationErrors.location ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="e.g., Highway A1, km 45, near Harare"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {validationErrors.location && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.location}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="incidentType"
              >
                Incident Type <span className="text-red-500">*</span>
              </label>
              <select
                id="incidentType"
                name="incidentType"
                className={`w-full px-3 py-2 border ${validationErrors.incidentType ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                value={formData.incidentType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Type</option>
                {incidentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {validationErrors.incidentType && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.incidentType}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="incidentArea"
              >
                Incident Area
              </label>
              <input
                type="text"
                id="incidentArea"
                name="incidentArea"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Front bumper, Left side, Engine"
                value={formData.incidentArea}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="weatherCondition"
              >
                Weather Condition
              </label>
              <div className="relative">
                <Cloud className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <select
                  id="weatherCondition"
                  name="weatherCondition"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.weatherCondition}
                  onChange={handleInputChange}
                >
                  <option value="">Select Weather Condition</option>
                  {weatherConditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="severityRating"
              >
                Severity Rating
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["Low", "Medium", "High", "Critical"].map((rating) => (
                  <label key={rating} className="flex items-center justify-center">
                    <input
                      type="radio"
                      name="severityRating"
                      value={rating}
                      checked={formData.severityRating === rating}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-full text-center py-2 rounded cursor-pointer ${
                        formData.severityRating === rating
                          ? rating === "Low"
                            ? "bg-green-500 text-white"
                            : rating === "Medium"
                              ? "bg-yellow-500 text-white"
                              : rating === "High"
                                ? "bg-orange-500 text-white"
                                : "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {rating}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="vehicleActivity"
              >
                Vehicle Activity at Time of Incident
              </label>
              <select
                id="vehicleActivity"
                name="vehicleActivity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.vehicleActivity}
                onChange={handleInputChange}
              >
                <option value="">Select Activity</option>
                {activityTypes.map((activity) => (
                  <option key={activity} value={activity}>
                    {activity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
              Description of How Incident Happened <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className={`w-full px-3 py-2 border ${validationErrors.description ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="Provide a detailed description of the incident..."
              value={formData.description}
              onChange={handleInputChange}
              required
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="damageDescription"
            >
              Equipment Damage Summary
            </label>
            <textarea
              id="damageDescription"
              name="damageDescription"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Describe any damage to the vehicle or equipment..."
              value={formData.damageDescription}
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Upload (Max 6)
            </label>

            <div className="flex flex-wrap gap-4 mb-4">
              {/* Display previously uploaded images */}
              {formData.imageUrls?.map((url, index) => (
                <div
                  key={`prev-${index}`}
                  className="relative w-24 h-24 border rounded overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`Previous ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"
                    onClick={onClick}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Display newly uploaded images */}
              {formData.images.map((file, index) => (
                <div key={index} className="relative w-24 h-24 border rounded overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"
                    onClick={onClick}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Upload button */}
              {formData.images.length + (formData.imageUrls?.length || 0) < 6 && (
                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <p className="text-xs text-gray-500">Upload</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Upload up to 6 images showing the incident scene and damage. Supported formats: JPG,
              PNG, GIF.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reportedBy">
              Reported By <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="reportedBy"
              name="reportedBy"
              className={`w-full px-3 py-2 border ${validationErrors.reportedBy ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
              placeholder="Full name of person reporting the incident"
              value={formData.reportedBy}
              onChange={handleInputChange}
              required
            />
            {validationErrors.reportedBy && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.reportedBy}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onClick}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              icon={<Save className="w-4 h-4 mr-2" />}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default IncidentReportForm;
