import { useWialonDrivers } from "../../hooks/useWialonDrivers";
import { useWialonResources } from "../../hooks/useWialonResources";
import { useWialonSdk } from "../../hooks/useWialonSdk";
import { useWialonSession } from "../../hooks/useWialonSession";
import React, { useState, useEffect } from "react";
import type { WialonApiSession } from "../../types/wialon";

export const DriverManager: React.FC = () => {
  const sdkReady = useWialonSdk();
  const { loggedIn, error, session } = useWialonSession(sdkReady);
  const resources = useWialonResources(session, loggedIn) || [];
  const [selectedRes, setSelectedRes] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null) as [string | null, React.Dispatch<React.SetStateAction<string | null>>];

  // Set initial resource selection if available
  useEffect(() => {
    if (resources && resources.length > 0 && !selectedRes) {
      setSelectedRes(resources[0]?.id ? Number(resources[0].id) : null);
    }
  }, [resources, selectedRes]);

  // Create a session with resource_id for the drivers hook
  const sessionWithResource = session && selectedRes ? {
    ...session,
    resource_id: selectedRes
  } : session;

  const drivers = useWialonDrivers(sessionWithResource as WialonApiSession | null);

  // Basic driver form state
  const [form, setForm] = useState({ id: "", n: "", ds: "", p: "" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // CRUD ops (Create/Update/Delete)
  const handleCreate = () => {
    setFormError(null);

    if (!selectedRes || !session) {
      setFormError("No session or resource selected");
      return;
    }

    try {
      // Safety check - ensure window.wialon is available
      if (!window.wialon || !window.wialon.core) {
        setFormError("Wialon SDK not initialized");
        return;
      }

      const res = window.wialon.core.Session.getInstance().getItem(selectedRes);

      if (!res) {
        setFormError(`Resource ${selectedRes} not found`);
        return;
      }

      // Check if createDriver method exists
      if (typeof res.createDriver !== 'function') {
        setFormError("Resource doesn't support driver creation");
        return;
      }

      res.createDriver(
        {
          itemId: selectedRes,
          id: 0,
          callMode: "create",
          c: "",
          ck: 0,
          ds: form.ds || "",
          n: form.n || "",
          p: form.p || "",
          r: 1,
          f: 0,
          jp: {},
        },
        (code: number, data: any) => {
          try {
            if (code !== 0) {
              const errorText = window.wialon?.core?.Errors?.getErrorText ?
                window.wialon.core.Errors.getErrorText(code) :
                `Error code: ${code}`;
              setFormError(`Driver create error: ${errorText}`);
            } else {
              alert(`Driver "${data?.n || 'Unknown'}" created!`);
              // Reset form after successful creation
              setForm({ id: "", n: "", ds: "", p: "" });
            }
          } catch (err) {
            console.error("Error in driver creation callback:", err);
            setFormError("Failed to process driver creation response");
          }
        }
      );
    } catch (err) {
      console.error("Error creating driver:", err);
      setFormError(`Failed to create driver: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Wialon Driver Manager</h2>

      {/* Display session errors */}
      {error && <div className="p-2 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}

      {/* Display form-specific errors */}
      {formError && <div className="p-2 mb-4 bg-red-100 text-red-700 rounded">{formError}</div>}

      {/* SDK Status */}
      <div className="mb-4">
        <span className={`px-2 py-1 rounded text-sm ${sdkReady ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          SDK: {sdkReady ? 'Ready' : 'Loading...'}
        </span>
        <span className={`ml-2 px-2 py-1 rounded text-sm ${loggedIn ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          Session: {loggedIn ? 'Active' : 'Not logged in'}
        </span>
      </div>

      {/* Resource selector */}
      <div className="mb-4">
        <label className="block mb-2">
          Resource:
          <select
            value={selectedRes ?? ""}
            onChange={(e) => setSelectedRes(e.target.value ? Number(e.target.value) : null)}
            className="ml-2 p-1 border rounded"
            disabled={!resources || resources.length === 0}
          >
            <option value="">-- select resource --</option>
            {Array.isArray(resources) && resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name || `Resource ${r.id}`}
              </option>
            ))}
          </select>
        </label>
        {(!resources || resources.length === 0) && loggedIn && (
          <p className="text-sm text-yellow-600">No resources available. Make sure you have access to resources with driver data.</p>
        )}
      </div>

      {/* Drivers List */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Drivers {drivers.length > 0 && `(${drivers.length})`}</h3>
        {drivers.length === 0 ? (
          <p className="text-sm text-gray-500">No drivers found. Select a resource or create a new driver.</p>
        ) : (
          <ul className="border rounded divide-y">
            {drivers.map((d) => (
              <li key={d.id} className="p-2 hover:bg-gray-50">
                <div className="font-medium">{d.n || d.name || 'Unnamed Driver'}</div>
                {d.ds && <div className="text-sm text-gray-600">{d.ds}</div>}
                {d.p && <div className="text-sm text-gray-600">{d.p}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Driver Create Form */}
      <form
        className="border rounded p-3"
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
      >
        <h4 className="font-medium mb-2">Create New Driver</h4>
        <div className="space-y-2 mb-3">
          <div>
            <input
              name="n"
              placeholder="Name"
              value={form.n}
              onChange={handleChange}
              className="w-full p-1 border rounded"
              required
            />
          </div>
          <div>
            <input
              name="ds"
              placeholder="Description"
              value={form.ds}
              onChange={handleChange}
              className="w-full p-1 border rounded"
            />
          </div>
          <div>
            <input
              name="p"
              placeholder="Phone"
              value={form.p}
              onChange={handleChange}
              className="w-full p-1 border rounded"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={!selectedRes || !loggedIn}
        >
          Create Driver
        </button>
      </form>
    </div>
  );
};
