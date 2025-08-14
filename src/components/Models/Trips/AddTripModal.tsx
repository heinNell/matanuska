import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../../utils/firebaseConnectionHandler";
import Modal from "../../ui/Modal";

// Interface definitions from your original code
interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tripData: any) => void;
}

interface Client {
  id: string;
  client: string;
  type?: "Internal" | "External";
}

interface Driver {
  idNo: string;
  name: string;
  surname: string;
}

interface Fleet {
  fleetNumber: string;
  registration: string;
  make: string;
  model: string;
}

interface Route {
  route: string;
  distance: number;
}

const AddTripModal: React.FC<AddTripModalProps> = ({ isOpen, onClose, onSubmit }) => {
  // Form state
  const [clientType, setClientType] = useState<"Internal" | "External">("Internal");
  const [fleetNumber, setFleetNumber] = useState("");
  const [externalClient, setExternalClient] = useState("");
  const [client, setClient] = useState("");
  const [driver, setDriver] = useState("");
  const [route, setRoute] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [distance, setDistance] = useState(0);
  const [baseRevenue, setBaseRevenue] = useState("");
  const [tripNotes, setTripNotes] = useState("");
  const [revenueCurrency, setRevenueCurrency] = useState("ZAR");
  const [tripDescription, setTripDescription] = useState("");

  // Data from Firestore
  const [clients, setClients] = useState<Client[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch clients
        const clientsSnapshot = await getDocs(collection(firestore, "clients"));
        const clientsData = clientsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            client: data.client || "",
            type: (data.type as "Internal" | "External") || "Internal",
          };
        });
        setClients(clientsData);

        // Fetch drivers
        const driversSnapshot = await getDocs(collection(firestore, "drivers"));
        const driversData = driversSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            idNo: data.idNo || doc.id,
            name: data.name || "",
            surname: data.surname || "",
          };
        });
        setDrivers(driversData);

        // Fetch fleet
        const fleetSnapshot = await getDocs(collection(firestore, "fleet"));
        const fleetData = fleetSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            fleetNumber: data.fleetNumber || "",
            registration: data.registration || "",
            make: data.make || "",
            model: data.model || "",
          };
        });
        setFleets(fleetData);

        // Fetch routes
        const routesSnapshot = await getDocs(collection(firestore, "routeDistances"));
        const routesData = routesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            route: data.route || "",
            distance: data.distance || 0,
          };
        });
        setRoutes(routesData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Update distance when route changes
  useEffect(() => {
    if (route) {
      const selectedRoute = routes.find((r) => r.route === route);
      if (selectedRoute) {
        setDistance(selectedRoute.distance);
      }
    }
  }, [route, routes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tripData = {
      clientType,
      fleetNumber,
      externalClient: clientType === "External" ? externalClient : null,
      client,
      driver,
      route,
      startDate,
      endDate,
      distance,
      baseRevenue: parseFloat(baseRevenue),
      tripNotes,
      revenueCurrency,
      tripDescription,
      status: "Active",
      createdAt: new Date().toISOString(),
    };

    onSubmit(tripData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Trip">
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Client Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Type <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={clientType}
                onChange={(e) => setClientType(e.target.value as "Internal" | "External")}
                required
              >
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              </select>
            </div>

            {/* Fleet Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fleet Number <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={fleetNumber}
                onChange={(e) => setFleetNumber(e.target.value)}
                required
              >
                <option value="">Select Fleet Number</option>
                {fleets.map((fleet) => (
                  <option key={fleet.fleetNumber} value={fleet.fleetNumber}>
                    {fleet.fleetNumber} - {fleet.registration} ({fleet.make} {fleet.model})
                  </option>
                ))}
              </select>
            </div>

            {/* External Client - Only show if client type is External */}
            {clientType === "External" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External Client
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={externalClient}
                  onChange={(e) => setExternalClient(e.target.value)}
                />
              </div>
            )}

            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                required
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.client}>
                    {client.client}
                  </option>
                ))}
              </select>
            </div>

            {/* Driver */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                required
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver.idNo} value={`${driver.name} ${driver.surname}`}>
                    {driver.name} {driver.surname}
                  </option>
                ))}
              </select>
            </div>

            {/* Route */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Route (semicolon separated) <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                required
              >
                <option value="">Select Route</option>
                {routes.map((route, index) => (
                  <option key={index} value={route.route}>
                    {route.route} ({route.distance} km)
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            {/* Distance (KM) - Auto-populated based on route selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance (KM)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                value={distance}
                readOnly
              />
            </div>

            {/* Base Revenue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Revenue <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={baseRevenue}
                onChange={(e) => setBaseRevenue(e.target.value)}
                required
              />
            </div>

            {/* Revenue Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Revenue Currency <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={revenueCurrency}
                onChange={(e) => setRevenueCurrency(e.target.value)}
                required
              >
                <option value="ZAR">ZAR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {/* Trip Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Trip Notes</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={tripNotes}
              onChange={(e) => setTripNotes(e.target.value)}
            />
          </div>

          {/* Trip Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trip Description <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={tripDescription}
              onChange={(e) => setTripDescription(e.target.value)}
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? "Loading..." : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddTripModal;
