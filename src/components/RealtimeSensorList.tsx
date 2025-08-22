import React, { useEffect, useState } from "react";
import { ISensor } from "../types/sensor-types";
import {
  fetchSensors,
  subscribeToSensorUpdates
} from "../services/sensorService";

const RealtimeSensorList: React.FC = () => {
  const [sensors, setSensors]   = useState<ISensor[]>([]);
  const [loading, setLoading]   = useState(true);

  /* initial load + realtime listener */
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      /* 1️⃣  initial data */
      const initial = await fetchSensors();
      setSensors(initial);
      setLoading(false);

      /* 2️⃣  live updates */
      unsubscribe = subscribeToSensorUpdates(setSensors);
    })();

    /* cleanup on unmount */
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  /* ------------- UI --------------------------------------------------- */
  if (loading)                return <p className="p-4">Loading sensors…</p>;
  if (sensors.length === 0)   return <p className="p-4">No sensors available.</p>;

  return (
    <table className="w-full bg-white shadow rounded">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-3 py-2 text-left">Name</th>
          <th className="px-3 py-2 text-left">Value</th>
          <th className="px-3 py-2 text-left">Unit</th>
        </tr>
      </thead>
      <tbody>
        {sensors.map(s => (
          <tr key={s.id} className="even:bg-gray-50">
            <td className="px-3 py-2">{s.name}</td>
            <td className="px-3 py-2">{s.value}</td>
            <td className="px-3 py-2">{s.unit}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RealtimeSensorList;
