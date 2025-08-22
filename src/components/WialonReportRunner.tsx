import { useState, useEffect } from "react";
import { useWialonAuth } from "../context/WialonAuthContext";
import { useWialonResources } from "../hooks/useWialonResources";

export default function WialonReportRunner() {
  const { loginData, isLoggedIn } = useWialonAuth();
  const resources = useWialonResources(loginData?.session, isLoggedIn);

  const [selectedResource, setSelectedResource] = useState<number | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-bold mb-2">Wialon Reports</h2>
        <p>Please log in to access reports</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-2">Wialon Reports</h2>

      <div className="mb-4">
        <label className="block mb-2">
          Resource:
          <select
            value={selectedResource ?? ""}
            onChange={(e) => setSelectedResource(Number(e.target.value) || null)}
            className="ml-2 p-1 border border-gray-300 rounded"
          >
            <option value="">-- select resource --</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Available Resources: {resources.length}</h3>
        {resources.map((resource) => (
          <div key={resource.id} className="p-2 border-b">
            <div className="font-medium">{resource.name}</div>
            <div className="text-sm text-gray-600">ID: {resource.id}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
