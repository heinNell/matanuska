import React, { useState } from "react";
import { useWialonResources } from "../hooks/useWialonResources";
import { useWialonDrivers } from "../hooks/useWialonDrivers";

interface DriverManagerProps {
  session: any;
  loggedIn: boolean;
}

const DriverManager: React.FC<DriverManagerProps> = ({ session, loggedIn }) => {
  const resources = useWialonResources(session, loggedIn);
  const [selectedRes, setSelectedRes] = useState<number | null>(null);
  const drivers = useWialonDrivers(selectedRes);

  // Basic driver form state
  const [form, setForm] = useState({ n: "", ds: "", p: "" });

  // NOTE: Driver creation will require session injection, or refactor to use a context or pass session
  // For this example, we'll keep the UI; actual mutation logic needs your Wialon session.

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement actual driver create logic via your service/session here
    alert("Driver creation not implemented in this demo component.");
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-2">Wialon Drivers</h2>
      <label className="block mb-2">
        Resource:
        <select
          value={selectedRes ?? ""}
          onChange={(e) => setSelectedRes(Number(e.target.value))}
          className="ml-2 p-1 border border-gray-300 rounded"
        >
          <option value="">-- select resource --</option>
          {resources.map((r: any) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>
      <ul className="mb-4">
        {drivers.map((d: any) => (
          <li key={d.id}>
            {d.n} {d.ds} {d.p}
          </li>
        ))}
      </ul>
      <form onSubmit={handleCreate} className="space-y-2">
        <input
          name="n"
          placeholder="Name"
          value={form.n}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="ds"
          placeholder="Description"
          value={form.ds}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="p"
          placeholder="Phone"
          value={form.p}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <button type="submit" className="p-2 bg-blue-600 text-white rounded">
          Create Driver
        </button>
      </form>
    </div>
  );
};

export default DriverManager;
