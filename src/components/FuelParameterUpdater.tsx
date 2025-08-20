import React, { useState } from "react";
import { useWialonFuel } from "@/hooks/useWialonFuel";

export const FuelParameterUpdater: React.FC<{ itemId: number }> = ({ itemId }) => {
  const { updateFuelMathParams, loading, error, success } = useWialonFuel();
  const [params, setParams] = useState({ idling: 0, urban: 0, suburban: 0 });

  return (
    <form className="bg-white p-4 rounded shadow" onSubmit={e => {
      e.preventDefault();
      updateFuelMathParams(itemId, params.idling, params.urban, params.suburban);
    }}>
      <h3 className="font-semibold mb-2">Update Fuel (Math) Params</h3>
      {["idling", "urban", "suburban"].map(k => (
        <div key={k} className="mb-2">
          <label>{k}</label>
          <input type="number" value={params[k as keyof typeof params]} onChange={e =>
            setParams(prev => ({ ...prev, [k]: parseFloat(e.target.value) }))} className="ml-2 border p-1" required />
        </div>
      ))}
      <button type="submit" className="bg-sky-600 text-white px-4 py-1 rounded" disabled={loading}>
        Update
      </button>
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
    </form>
  );
};
