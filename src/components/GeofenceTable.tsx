import React, { useState } from "react";
import { useWialonResources } from "../hooks/useWialonResources";
import useWialonGeofences from "../hooks/useWialonGeofences";

interface GeofenceTableProps {
  session: any;
  loggedIn: boolean;
}

const GeofenceTable: React.FC<GeofenceTableProps> = ({ session, loggedIn }) => {
  const [selectedResId, setSelectedResId] = useState<number | null>(null);

  // Load Wialon resources
  const resources = useWialonResources(session, loggedIn);

  // Load geofences
  const { geofences, isLoading, error } = useWialonGeofences(resources, selectedResId);

  return (
    <div className="p-6">
      {loggedIn && !resources.length && <p>Loading resources...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <h2 className="text-lg font-bold mb-2">Wialon Geofences</h2>
      <label className="block mb-2">
        Resource:
        <select
          value={selectedResId ?? ""}
          onChange={(e) => setSelectedResId(Number(e.target.value))}
          className="ml-2 p-1 border border-gray-300 rounded"
        >
          <option value="">-- select resource --</option>
          {resources.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </label>

      {isLoading && <p>Loading geofences...</p>}

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-4">ID</th>
            <th className="py-2 px-4">Name</th>
            <th className="py-2 px-4">Type</th>
          </tr>
        </thead>
        <tbody>
          {geofences.map((geo) => (
            <tr key={geo.id}>
              <td className="py-2 px-4">{geo.id}</td>
              <td className="py-2 px-4">{geo.n}</td>
              <td className="py-2 px-4">{geo.t}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-sm text-gray-500 text-center">
        Showing {geofences.length} geofences
      </div>
    </div>
  );
};

export default GeofenceTable;
