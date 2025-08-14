import { Button, Card, CardContent, CardHeader } from "@/components/ui";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoadConfirmationData {
  confirmationNumber: string;
  date: string;
  clientName: string;
  clientCompany: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  pickupLocation: string;
  pickupDate: string;
  pickupTime: string;
  deliveryLocation: string;
  deliveryDate: string;
  deliveryTime: string;
  goodsDescription: string;
  quantity: string;
  weight: string;
  temperatureControl: string;
  truckRequired: string;
  trailerType: string;
  ratePerTrip: string;
  rateBasis: string;
  paymentTerms: string;
  additionalCosts: string;
  authorizedBy: {
    name: string;
    position: string;
    date: string;
  };
}

const CreateLoadConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const generateLoadConfirmationNumber = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `LC-${randomNum}`;
  };

  const [formData, setFormData] = useState<LoadConfirmationData>({
    confirmationNumber: generateLoadConfirmationNumber(),
    date: today,
    clientName: "",
    clientCompany: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    pickupLocation: "",
    pickupDate: "",
    pickupTime: "",
    deliveryLocation: "",
    deliveryDate: "",
    deliveryTime: "",
    goodsDescription: "",
    quantity: "",
    weight: "",
    temperatureControl: "",
    truckRequired: "",
    trailerType: "",
    ratePerTrip: "",
    rateBasis: "Per Load",
    paymentTerms: "30 Days from Invoice Date",
    additionalCosts: "Tolls, Border Charges, Fuel Surcharge (if any)",
    authorizedBy: {
      name: "",
      position: "",
      date: today,
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Check if the field is part of the authorizedBy object
    if (name.startsWith("authorizedBy.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        authorizedBy: {
          ...formData.authorizedBy,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const db = getFirestore();
      const loadConfirmationData = {
        ...formData,
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      await addDoc(collection(db, "loadConfirmations"), loadConfirmationData);
      setSuccess(true);
      setTimeout(() => {
        navigate("/trips");
      }, 2000);
    } catch (err) {
      console.error("Error creating load confirmation:", err);
      setError("Failed to create load confirmation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Create Load Confirmation</h1>
        <Button onClick={() => navigate("/trips")}>Back to Trips</Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Load confirmation created successfully! Redirecting...
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-medium">Load Confirmation Details</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="confirmationNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Load Confirmation No
              </label>
              <input
                type="text"
                id="confirmationNumber"
                name="confirmationNumber"
                value={formData.confirmationNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-medium">Client Information</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                Client/Supplier Name
              </label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="clientCompany" className="block text-sm font-medium text-gray-700">
                Client/Supplier Company Name
              </label>
              <input
                type="text"
                id="clientCompany"
                name="clientCompany"
                value={formData.clientCompany}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                Contact Person
              </label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-medium">Load Details</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700">
                Pick-up Location
              </label>
              <textarea
                id="pickupLocation"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="deliveryLocation" className="block text-sm font-medium text-gray-700">
                Delivery Location
              </label>
              <textarea
                id="deliveryLocation"
                name="deliveryLocation"
                value={formData.deliveryLocation}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700">
                  Pick-up Date
                </label>
                <input
                  type="date"
                  id="pickupDate"
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700">
                  Pick-up Time
                </label>
                <input
                  type="time"
                  id="pickupTime"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700">
                  Delivery Date
                </label>
                <input
                  type="date"
                  id="deliveryDate"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700">
                  Delivery Time
                </label>
                <input
                  type="time"
                  id="deliveryTime"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="goodsDescription" className="block text-sm font-medium text-gray-700">
                Goods Description
              </label>
              <input
                type="text"
                id="goodsDescription"
                name="goodsDescription"
                value={formData.goodsDescription}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="text"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Weight (in Tons/Kg)
              </label>
              <input
                type="text"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="temperatureControl"
                className="block text-sm font-medium text-gray-700"
              >
                Temperature Control (if applicable)
              </label>
              <input
                type="text"
                id="temperatureControl"
                name="temperatureControl"
                value={formData.temperatureControl}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="truckRequired" className="block text-sm font-medium text-gray-700">
                Truck Required
              </label>
              <input
                type="text"
                id="truckRequired"
                name="truckRequired"
                value={formData.truckRequired}
                onChange={handleInputChange}
                placeholder="e.g. Refrigerated 34-ton"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="trailerType" className="block text-sm font-medium text-gray-700">
                Trailer Type
              </label>
              <input
                type="text"
                id="trailerType"
                name="trailerType"
                value={formData.trailerType}
                onChange={handleInputChange}
                placeholder="e.g. Tri-Axle Interlink"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-medium">Rates & Terms</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ratePerTrip" className="block text-sm font-medium text-gray-700">
                Rate per Trip (ZAR)
              </label>
              <input
                type="text"
                id="ratePerTrip"
                name="ratePerTrip"
                value={formData.ratePerTrip}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="rateBasis" className="block text-sm font-medium text-gray-700">
                Rate Basis
              </label>
              <select
                id="rateBasis"
                name="rateBasis"
                value={formData.rateBasis}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="Per Load">Per Load</option>
                <option value="Per Ton">Per Ton</option>
                <option value="Per Km">Per Km</option>
              </select>
            </div>

            <div>
              <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700">
                Payment Terms
              </label>
              <input
                type="text"
                id="paymentTerms"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="additionalCosts" className="block text-sm font-medium text-gray-700">
                Additional Costs
              </label>
              <input
                type="text"
                id="additionalCosts"
                name="additionalCosts"
                value={formData.additionalCosts}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div className="md:col-span-2">
              <h3 className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</h3>
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50 text-sm">
                <p className="font-medium mb-2">Bulk Transport Discounts:</p>
                <ul className="list-disc pl-5 mb-2">
                  <li>
                    Discounts on Rate Per Load: Discounts will be offered on certain agreed routes
                    and based on the number of loads per month.
                  </li>
                  <li>
                    Special Rates: Special rates will apply when backloads are provided from the
                    point of off-loading to the point of origin.
                  </li>
                </ul>

                <p className="font-medium mb-2">Rates and Validity:</p>
                <ul className="list-disc pl-5 mb-2">
                  <li>Rates are subject to change with prior notice</li>
                </ul>

                <p className="font-medium mb-2">Annual Adjustments:</p>
                <ul className="list-disc pl-5 mb-2">
                  <li>
                    Annual price escalation takes effect in the business commencement month,
                    displayed on the tariff list
                  </li>
                </ul>

                <p className="font-medium mb-2">Fuel Adjustments:</p>
                <ul className="list-disc pl-5 mb-2">
                  <li>
                    Monthly fuel adjustments as per statutory notifications. Rates quoted will be
                    adjusted on a monthly basis depending on fluctuation in fuel price.
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-medium">Authorization</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="authorizedBy.name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="authorizedBy.name"
                name="authorizedBy.name"
                value={formData.authorizedBy.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="authorizedBy.position"
                className="block text-sm font-medium text-gray-700"
              >
                Position
              </label>
              <input
                type="text"
                id="authorizedBy.position"
                name="authorizedBy.position"
                value={formData.authorizedBy.position}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="authorizedBy.date"
                className="block text-sm font-medium text-gray-700"
              >
                Date
              </label>
              <input
                type="date"
                id="authorizedBy.date"
                name="authorizedBy.date"
                value={formData.authorizedBy.date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => navigate("/trips")}
            type="button"
            className="mr-2 bg-gray-600 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Load Confirmation"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateLoadConfirmationPage;
