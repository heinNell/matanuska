import { Vehicle } from '@/types/vehicle';

const API_BASE = import.meta.env.VITE_API_URL || 'https://hst-api.wialon.com';

/**
 * Fetch all vehicles from the backend
 */
export const fetchVehicleData = async (): Promise<Vehicle[]> => {
  const res = await fetch(`${API_BASE}/vehicles`);
  if (!res.ok) throw new Error(`Failed to fetch vehicles: ${res.statusText}`);
  return await res.json();
};

/**
 * Fetch a single vehicle by its ID
 */
export const fetchVehicleById = async (id: string): Promise<Vehicle | null> => {
  const res = await fetch(`${API_BASE}/vehicles/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch vehicle: ${res.statusText}`);
  return await res.json();
};

/**
 * Update vehicle location, heading and speed
 */
export const updateVehicleLocation = async (
  id: string,
  location: { lat: number; lng: number },
  heading?: number,
  speed?: number
): Promise<Vehicle | null> => {
  const body = { location, heading, speed };
  const res = await fetch(`${API_BASE}/vehicles/${id}/location`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to update vehicle location: ${res.statusText}`);
  return await res.json();
};

/**
 * Update vehicle status (active, inactive, maintenance)
 */
export const updateVehicleStatus = async (
  id: string,
  status: 'active' | 'inactive' | 'maintenance'
): Promise<Vehicle | null> => {
  const res = await fetch(`${API_BASE}/vehicles/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to update vehicle status: ${res.statusText}`);
  return await res.json();
};

/**
 * Create a new vehicle entry
 */
export const createVehicle = async (vehicle: Omit<Vehicle, 'id' | 'lastUpdate'>): Promise<Vehicle> => {
  const res = await fetch(`${API_BASE}/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehicle),
  });

  if (!res.ok) throw new Error(`Failed to create vehicle: ${res.statusText}`);
  return await res.json();
};

/**
 * Delete a vehicle by ID
 */
export const deleteVehicle = async (id: string): Promise<boolean> => {
  const res = await fetch(`${API_BASE}/vehicles/${id}`, {
    method: 'DELETE'
  });

  if (res.status === 404) return false;
  if (!res.ok) throw new Error(`Failed to delete vehicle: ${res.statusText}`);
  return true;
};
