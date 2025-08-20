import { useState } from "react";
import { wialonService } from "@/utils/wialonService";

export function useWialonFuel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateFuelMathParams = async (
    unitId: number,
    idling: number,
    urban: number,
    suburban: number
  ) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await wialonService.updateFuelMathParams(unitId, idling, urban, suburban);
      setSuccess("Fuel parameters updated successfully.");
    } catch (err: any) {
      setError(err?.message || "Failed to update fuel parameters.");
    } finally {
      setLoading(false);
    }
  };

  return { updateFuelMathParams, loading, error, success };
}

