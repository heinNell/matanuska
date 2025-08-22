import React from "react";
import { useSensors } from "../hooks/useSensors";
import { ISensor } from "../types/sensor-types";

const SensorList: React.FC = () => {
  // ⬇️  use the hook that already handles loading / error / data
  const { sensors, loading, error } = useSensors();

  if (loading)              return <p>Loading…</p>;
  if (error)                return <p className="text-red-600">Error: {error}</p>;
  if (sensors.length === 0) return <p>No sensors available.</p>;

  return (
    <ul className="space-y-2">
      {sensors.map((s: ISensor) => (
        <li key={s.id} className="border p-2 rounded">
          {s.name}: {s.value}
          {s.unit}
        </li>
      ))}
    </ul>
  );
};

export default SensorList;
