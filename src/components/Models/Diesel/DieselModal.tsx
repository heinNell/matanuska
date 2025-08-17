// src/components/Models/Diesel/DieselModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { addDieselRecord, updateDieselRecord } from "../../../services/dieselService";
import type { DieselConsumptionRecord } from "../../../types/diesel";
import { Timestamp } from "firebase/firestore";
// If you have a UI kit barrel, swap these for your components
import { Button } from "../../../components/ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  /** If provided -> edit mode. If omitted -> create mode. */
  initial?: DieselConsumptionRecord | null;
};

export default function DieselModal({ open, onClose, initial }: Props) {
  const isEdit = Boolean(initial?.id);

  const [fleetNumber, setFleetNumber] = useState(initial?.fleetNumber ?? "");
  const [driverName, setDriverName] = useState(initial?.driverName ?? "");
  const [dateISO, setDateISO] = useState<string>(
    // prefer Timestamp (initial.date), fall back to initial.dateISO
    initial?.date
      ? initial.date.toDate().toISOString().slice(0, 10)
      : (initial?.dateISO ?? new Date().toISOString().slice(0, 10))
  );
  const [litresFilled, setLitresFilled] = useState<number>(initial?.litresFilled ?? 0);
  const [totalCost, setTotalCost] = useState<number>(initial?.totalCost ?? 0);
  const [currency, setCurrency] = useState<string>(initial?.currency ?? "ZAR");
  const [fuelStation, setFuelStation] = useState<string>(initial?.fuelStation ?? "");
  const [stationType, setStationType] = useState<"onsite" | "public" | "vendor">(
    (initial?.stationType as any) ?? "onsite"
  );
  const [kmReading, setKmReading] = useState<number | undefined>(initial?.kmReading);
  const [previousKmReading, setPreviousKmReading] = useState<number | undefined>(
    initial?.previousKmReading
  );
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");

  const [saving, setSaving] = useState(false);
  const disabled = useMemo(
    () => !fleetNumber || !driverName || !dateISO || litresFilled <= 0 || totalCost < 0,
    [fleetNumber, driverName, dateISO, litresFilled, totalCost]
  );

  useEffect(() => {
    if (!open) return;
    // If initial changes while open, sync (rare)
    if (initial) {
      setFleetNumber(initial.fleetNumber ?? "");
      setDriverName(initial.driverName ?? "");
      setDateISO(
        initial.date
          ? initial.date.toDate().toISOString().slice(0, 10)
          : (initial.dateISO ?? new Date().toISOString().slice(0, 10))
      );
      setLitresFilled(initial.litresFilled ?? 0);
      setTotalCost(initial.totalCost ?? 0);
      setCurrency(initial.currency ?? "ZAR");
      setFuelStation(initial.fuelStation ?? "");
      setStationType((initial.stationType as any) ?? "onsite");
      setKmReading(initial.kmReading);
      setPreviousKmReading(initial.previousKmReading);
      setNotes(initial.notes ?? "");
    }
  }, [open, initial]);

  const onSave = async () => {
    if (disabled) return;
    setSaving(true);
    try {
      const payload: DieselConsumptionRecord = {
        id: initial?.id ?? "",
        fleetNumber,
        driverName,
        // send both, service will normalize to Timestamp
        dateISO,
        date: Timestamp.fromDate(new Date(`${dateISO}T00:00:00`)),
        litresFilled: Number(litresFilled),
        totalCost: Number(totalCost),
        currency,
        fuelStation,
        stationType,
        kmReading: kmReading ? Number(kmReading) : undefined,
        previousKmReading: previousKmReading ? Number(previousKmReading) : undefined,
        notes,
        // optional metadata left undefined unless you capture them in the UI
        vehicleId: undefined,
        tripId: initial?.tripId,
        source: initial?.source ?? "manual",
      };

      if (isEdit && initial?.id) {
        await updateDieselRecord(initial.id, payload);
      } else {
        await addDieselRecord(payload);
      }
      onClose();
    } catch (e) {
      console.error("Failed to save diesel record", e);
      alert("Failed to save diesel record");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Diesel Record" : "Add Diesel Record"}
          </h2>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <L label="Fleet Number">
              <input
                className="w-full border border-[#d1d5db] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                value={fleetNumber}
                onChange={(e) => setFleetNumber(e.target.value)}
              />
            </L>
            <L label="Driver Name">
              <input
                className="input"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
              />
            </L>
            <L label="Date">
              <input
                type="date"
                className="input"
                value={dateISO}
                onChange={(e) => setDateISO(e.target.value)}
              />
            </L>
            <L label="Fuel Station">
              <input
                className="input"
                value={fuelStation}
                onChange={(e) => setFuelStation(e.target.value)}
              />
            </L>
            <L label="Station Type">
              <select
                className="input"
                value={stationType}
                onChange={(e) => setStationType(e.target.value as any)}
              >
                <option value="onsite">Onsite</option>
                <option value="public">Public</option>
                <option value="vendor">Vendor</option>
              </select>
            </L>
            <L label="Currency">
              <input
                className="input"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </L>
            <L label="Litres Filled">
              <input
                type="number"
                className="input"
                value={litresFilled}
                onChange={(e) => setLitresFilled(Number(e.target.value))}
              />
            </L>
            <L label="Total Cost">
              <input
                type="number"
                className="input"
                value={totalCost}
                onChange={(e) => setTotalCost(Number(e.target.value))}
              />
            </L>
            <L label="Odometer (km)">
              <input
                type="number"
                className="input"
                value={kmReading ?? ""}
                onChange={(e) => setKmReading(e.target.value ? Number(e.target.value) : undefined)}
              />
            </L>
            <L label="Previous Odometer (km)">
              <input
                type="number"
                className="input"
                value={previousKmReading ?? ""}
                onChange={(e) =>
                  setPreviousKmReading(e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </L>
          </div>

          <L label="Notes">
            <textarea
              className="input min-h-[80px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </L>
        </div>

        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={disabled || saving}>
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Record"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Tiny label + control wrapper */
function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      <div>{children}</div>
    </label>
  );
}
