import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

export interface ClientData {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: "active" | "inactive";
}

export interface DriverData {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  status: "active" | "inactive" | "on-leave";
  licenseExpiry?: string;
}

export interface VehicleData {
  id: string;
  fleetNumber: string;
  registration: string;
  make: string;
  model: string;
  vehicleType: string;
  status: string;
  odometer?: number;
}

export interface RouteData {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: number;
}

export const useClientsData = () => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const clientsRef = collection(db, "clients");
        const snapshot = await getDocs(clientsRef);
        const clientsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ClientData, "id">),
        }));
        setClients(clientsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching clients data:", err);
        setError("Failed to load clients data");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return { clients, loading, error };
};

export const useDriversData = () => {
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const driversRef = collection(db, "drivers");
        const snapshot = await getDocs(driversRef);
        const driversData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<DriverData, "id">),
        }));
        setDrivers(driversData);
        setError(null);
      } catch (err) {
        console.error("Error fetching drivers data:", err);
        setError("Failed to load drivers data");
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  return { drivers, loading, error };
};

export const useVehiclesData = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const vehiclesRef = collection(db, "fleet");
        const snapshot = await getDocs(vehiclesRef);
        const vehiclesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<VehicleData, "id">),
        }));
        setVehicles(vehiclesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching vehicles data:", err);
        setError("Failed to load vehicles data");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return { vehicles, loading, error };
};

export const useRoutesData = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const routesRef = collection(db, "routes");
        const snapshot = await getDocs(routesRef);
        const routesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<RouteData, "id">),
        }));
        setRoutes(routesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching routes data:", err);
        setError("Failed to load routes data");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  return { routes, loading, error };
};

export const useTrip = (tripId: string | null) => {
  const [trip, setTrip] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) return;

    const fetchTrip = async () => {
      try {
        setLoading(true);
        const tripRef = doc(db, "trips", tripId);
        const tripDoc = await getDoc(tripRef);

        if (tripDoc.exists()) {
          setTrip({ id: tripDoc.id, ...tripDoc.data() });
          setError(null);
        } else {
          setError("Trip not found");
          setTrip(null);
        }
      } catch (err) {
        console.error("Error fetching trip data:", err);
        setError("Failed to load trip data");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  return { trip, loading, error };
};
