import React, { useEffect, useState } from "react";
import { ISensor } from "../types/sensor-types";

/* ✔️  now supplied by firebase.ts */
import { dbRef, dbOn, dbOff } from "../firebase";

const SENSORS_PATH = "sensors";             // RTDB node
const pathRef = dbRef(SENSORS_PATH);        // single-arg helper

const RealtimeSensorTable: React.FC = () => {
  const [sensors, setSensors] = useState<ISensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // subscribe
    const unsubscribe = dbOn(pathRef, snap => {
      const val = snap.val() as Record<string, ISensor> | null;
      setSensors(val ? Object.values(val) : []);
      setLoading(false);
    });

    // clean-up
    return () => {
      dbOff(pathRef);
      unsubscribe();         // safety – detach listener
    };
  }, []);

  if (loading)               return <p className="p-4">Loading sensors…</p>;
  if (sensors.length === 0)  return <p className="p-4">No sensors available.</p>;

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

export default RealtimeSensorTable;
