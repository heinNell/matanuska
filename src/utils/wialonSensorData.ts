// wialonSensorData.ts - Safe & typed utility for AVL unit sensor parsing

// Add this at the top if not already declared globally in a .d.ts file:
declare var wialon: any;

export interface WialonSensor {
  id: number;
  n: string;
  t: string;
  d: string;
  m: string;
  p: string;
  f: number;
  c: string;
  vt: number;
  vs: number;
  tbl: any[];
  ct: number;
  mt: number;
}

export interface WialonAVLUnit {
  general: { n: string };
  sensors: WialonSensor[];
}

export interface FuelTankData {
  tankName: string;
  currentLevel: number;
  maxCapacity: number;
  percentageFull: number;
  lastUpdated: Date;
}

export interface VehicleSensorData {
  fleetNumber: string;
  fullName: string;
  lastUpdated: Date;
  fuelTanks: FuelTankData[];
  externalVoltage?: number;
  signalStrength?: number;
  drivingBehavior?: {
    harshBraking?: number;
    harshAcceleration?: number;
    harshCornering?: number;
  };
}

/**
 * Extracts max capacity from Wialon sensor description string
 */
export const getMaxCapacityFromSensor = (d: string | undefined): number => {
  if (!d || typeof d !== "string" || !d.includes(":")) return 450;

  const parts = d
    .replaceAll("|", "")
    .split(":")
    .map((p) => parseFloat(p));

  let maxCapacity = 0;
  for (let i = 1; i < parts.length; i += 2) {
    const part = parts[i];
    if (part !== undefined && !isNaN(part) && part > maxCapacity) {
      maxCapacity = part;
    }
  }
  return maxCapacity > 0 ? maxCapacity : 450;
};

/**
 * Parses raw Wialon unit + lastMessage data into VehicleSensorData
 */
export const parseVehicleSensorData = (
  unit: any,
  lastMessage: any
): VehicleSensorData => {
  const name: string = unit?.getName?.() ?? "Unknown";
  const fleetNumber: string = name.split(" ")[0] ?? "Unknown";
  const unitData = unit?.getCustomProperty?.("avl_unit");

  let avlUnit: WialonAVLUnit;
  if (typeof unitData === "string") {
    try {
      avlUnit = JSON.parse(unitData) as WialonAVLUnit;
    } catch {
      avlUnit = { general: { n: name }, sensors: [] };
    }
  } else {
    avlUnit = unitData ?? { general: { n: name }, sensors: [] };
  }

  const sensors: WialonSensor[] = avlUnit?.sensors ?? [];
  const fuelTanks: FuelTankData[] = [];
  let externalVoltage: number | undefined;
  let signalStrength: number | undefined;
  let harshBraking: number | undefined;
  let harshAcceleration: number | undefined;
  let harshCornering: number | undefined;

  for (const sensor of sensors) {
    const paramKey = sensor?.p?.split?.("/")?.[0];
    const sensorValue = lastMessage?.p?.[paramKey as keyof typeof lastMessage.p];

    if (sensor.t === "fuel level" && typeof sensorValue === "number") {
      const maxCapacity = getMaxCapacityFromSensor(sensor.d);
      fuelTanks.push({
        tankName: sensor.n,
        currentLevel: sensorValue,
        maxCapacity,
        percentageFull: (sensorValue / maxCapacity) * 100,
        lastUpdated: new Date((lastMessage?.t ?? 0) * 1000),
      });
    }

    if (sensor.t === "voltage" && sensor.n === "External Voltage") {
      const v = lastMessage?.p?.[paramKey as keyof typeof lastMessage.p];
      if (typeof v === "number") externalVoltage = v;
    }

    if (sensor.t === "custom" && sensor.n === "Signal Strenght") {
      const s = lastMessage?.p?.[sensor.p as keyof typeof lastMessage.p];
      if (typeof s === "number") signalStrength = s;
    }

    if (sensor.t === "accelerometer") {
      const val = lastMessage?.p?.[sensor.p as keyof typeof lastMessage.p];
      if (typeof val === "number") {
        if (sensor.n === "Harsh Braking Parameters") harshBraking = val;
        if (sensor.n === "Harsh Acceleration Parameters") harshAcceleration = val;
        if (sensor.n === "Harsh Cornering Parameters") harshCornering = val;
      }
    }
  }

  return {
    fleetNumber,
    fullName: avlUnit?.general?.n ?? name,
    lastUpdated: new Date((lastMessage?.t ?? 0) * 1000),
    fuelTanks,
    externalVoltage,
    signalStrength,
    drivingBehavior: {
      harshBraking,
      harshAcceleration,
      harshCornering,
    },
  };
};

/**
 * Returns whether the given data is recent enough
 */
export const isSensorDataRecent = (
  data: VehicleSensorData,
  maxAgeMinutes = 30
): boolean => {
  const age = (Date.now() - data.lastUpdated.getTime()) / 60000;
  return age <= maxAgeMinutes;
};

/**
 * Utility to get total fuel level
 */
export const getTotalFuelLevel = (data: VehicleSensorData): number => {
  return data.fuelTanks.reduce((sum, tank) => sum + (tank.currentLevel || 0), 0);
};

/**
 * Utility to get total fuel capacity
 */
export const getTotalFuelCapacity = (data: VehicleSensorData): number => {
  return data.fuelTanks.reduce((sum, tank) => sum + (tank.maxCapacity || 0), 0);
};

/**
 * Async function to get vehicle sensor data by fleet number
 * This would typically integrate with Wialon API or your data source
 */
export const getVehicleSensorData = async (
  fleetNumber: string
): Promise<VehicleSensorData | null> => {
  try {
    // Defensive: check global wialon and required API
    if (
      typeof wialon === "undefined" ||
      !wialon.core?.Session?.getInstance ||
      !wialon.item?.Item?.dataFlag ||
      !wialon.item?.Unit?.dataFlag
    ) {
      throw new Error("Wialon SDK is not loaded or initialized");
    }

    const session = wialon.core.Session.getInstance();
    if (!session) throw new Error("Wialon session not initialized");

    // Defensive: getItems may not exist or may not return array
    const units: any[] =
      typeof session.getItems === "function"
        ? session.getItems("avl_unit") || []
        : [];

    // Find unit by fleet number
    const unit = units.find((u: any) =>
      typeof u?.getName === "function"
        ? u.getName().startsWith(fleetNumber)
        : false
    );

    if (!unit) {
      console.warn(`No unit found for fleet number ${fleetNumber}`);
      return null;
    }

    // Defensive: getLastMessage may not exist
    const lastMessage =
      typeof unit.getLastMessage === "function"
        ? unit.getLastMessage()
        : null;
    if (!lastMessage) {
      console.warn(`No last message available for unit ${unit.getName?.() ?? "unknown"}`);
      return null;
    }

    return parseVehicleSensorData(unit, lastMessage);
  } catch (error) {
    console.error("Error fetching vehicle sensor data:", error);
    return null;
  }
};

