import React, { useState } from "react";
import { useWialonSensor } from "@/hooks/useWialonSensor";
import { useWialonEvents } from "@/hooks/useWialonEvents";
import { FuelParameterUpdater } from "@/components/FuelParameterUpdater";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useWialonContext } from "@/context/WialonContext";

export const FleetLiveDashboard: React.FC = () => {
    const { units } = useWialonContext();
    const [selectedUnit, setSelectedUnit] = useState<number>(units?.[0]?.id ?? 0);
    const fuelSensorValue = useWialonSensor(selectedUnit, 1);
    const now = Math.floor(Date.now() / 1000);
    const events = useWialonEvents(selectedUnit, "sensors", now - 86400, now);
    const { prefs, savePrefs } = useUserPreferences("CURRENT_USER_ID");

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Fleet Live Dashboard</h1>
            <div className="mb-4">
                <label>Select Unit: </label>
                <select value={selectedUnit} onChange={e => setSelectedUnit(Number(e.target.value))}
                    className="border p-2 rounded">
                    {units?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-semibold mb-2">Live Fuel Sensor Value</h2>
                    <p className="text-xl">{fuelSensorValue}</p>
                </div>
                <FuelParameterUpdater itemId={selectedUnit} />
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-semibold mb-2">Preferences</h2>
                    <button className="bg-slate-500 text-white px-2 py-1 rounded" onClick={() => savePrefs({ lastUnit: selectedUnit })}>
                        Save Default Unit
                    </button>
                    <div>Current: {prefs?.lastUnit}</div>
                </div>
            </div>

            <div className="mt-8 bg-white p-4 rounded shadow">
                <h2 className="font-semibold mb-2">Last 24h Sensor Events</h2>
                <table className="min-w-full text-xs">
                    <thead>
                        <tr><th>ID</th><th>Type</th><th>Value</th><th>Time</th></tr>
                    </thead>
                    <tbody>
                        {events.map(ev =>
                            <tr key={ev.id}>
                                <td>{ev.id}</td>
                                <td>{ev.type}</td>
                                <td>{JSON.stringify(ev.value)}</td>
                                <td>{ev.time.toLocaleString()}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
