/**
 * Utility functions for fetching and processing Wialon sensor data
 * Specifically designed to work with AVL unit data for vehicles with fuel probes
 */

import { getWialonSession } from "@/api/wialon";

// Define interfaces for sensor data
export interface WialonSensor {
  id: number;
  n: string; // name
  t: string; // type
  d: string; // description/data
  m: string; // measurement unit
  p: string; // parameter
  f: number; // flags
  c: string; // configuration
  vt: number;
  vs: number;
  tbl: any[]; // calibration table
  ct: number; // created timestamp
  mt: number; // modified timestamp
}

export interface WialonUnitProfile {
  id: number;
  n: string; // name
  v: string; // value
  ct: number; // created timestamp
  mt: number; // modified timestamp
}

export interface WialonAVLUnit {
  type: string;
  version: string;
  mu: number;
  general: {
    n: string; // name
    uid: string; // unique ID
    uid2: string;
    ph: string; // phone
    ph2: string;
    psw: string;
    hw: string; // hardware
  };
  icon: {
    lib: string;
    url: string;
    imgRot: string;
  };
  counters: {
    cfl: number;
    cnm: number;
    cneh: number;
    cnkb: number;
  };
  advProps: any;
  fields: any[];
  afields: any[];
  profile: WialonUnitProfile[];
  intervals: any[];
  healthCheck: any;
  sensors: WialonSensor[];
  reportProps: any;
  aliases: any[];
  driving: any;
  trip: any;
}

export interface FuelTankData {
  tankName: string;
  currentLevel: number; // in liters
  maxCapacity: number; // in liters
  percentageFull: number; // 0-100
  lastUpdated: Date;
}

export interface VehicleSensorData {
  fleetNumber: string;
  fullName: string;
  lastUpdated: Date;
  position?: {
    latitude: number;
    longitude: number;
    speed: number;
    timestamp: number;
  };
  ignition: boolean;
  externalVoltage?: number;
  fuelTanks: FuelTankData[];
  signalStrength?: number;
  drivingBehavior?: {
    harshBraking?: number;
    harshAcceleration?: number;
    harshCornering?: number;
  };
}

/**
 * Parses the sensor description string to find the maximum fuel capacity.
 * The 'd' property string is in the format: |x1:y1:x2:y2:...
 * @param d The sensor description string.
 * @returns The maximum capacity in liters.
 */
const getMaxCapacityFromSensor = (d: string): number => {
  if (!d || !d.includes(":")) {
    return 450; // Default fallback
  }

  const parts = d
    .split(":")
    .map((p) => p.replace("|", ""))
    .map(parseFloat);
  let maxCapacity = 0;

  // y-values (liters) are at odd indices (1, 3, 5, ...)
  for (let i = 1; i < parts.length; i += 2) {
    if (!isNaN(parts[i]) && parts[i] > maxCapacity) {
      maxCapacity = parts[i];
    }
  }
  return maxCapacity > 0 ? maxCapacity : 450; // Return found max or default
};

/**
 * Get AVL unit data for a specific fleet number
 * @param fleetNumber The fleet number to search for (e.g., '21H')
 * @returns Promise resolving to the vehicle sensor data
 */
export const getVehicleSensorData = async (
  fleetNumber: string
): Promise<VehicleSensorData | null> => {
  try {
    // Get all units from Wialon
    const session = await getWialonSession();
    const wialonUnits = session ? await session.getUnits() : [];

    // Find the unit with the matching fleet number
    const unit = wialonUnits.find((u: any) => {
      const name = u.getName();
      return name.startsWith(fleetNumber);
    });

    if (!unit) {
      console.warn(`No unit found with fleet number ${fleetNumber}`);
      return null;
    }

    // Get the unit's position
    const position = unit.getPosition();

    // Get the unit's last message
    const lastMessage = unit.getLastMessage();

    // Get the unit's sensors
    const unitData = unit.getCustomProperty("avl_unit");

    // If we don't have the detailed unit data, return basic info
    if (!unitData) {
      return {
        fleetNumber,
        fullName: unit.getName(),
        lastUpdated: position ? new Date(position.t * 1000) : new Date(),
        position: position
          ? {
              latitude: position.y,
              longitude: position.x,
              speed: position.s,
              timestamp: position.t,
            }
          : undefined,
        ignition: lastMessage?.p?.["ignition"] === 1,
        fuelTanks: [],
      };
    }

    // Parse the unit data
    const avlUnit: WialonAVLUnit = typeof unitData === "string" ? JSON.parse(unitData) : unitData;

    // Extract sensor data
    const sensors = avlUnit.sensors || [];

    // Find fuel tank sensors
    const fuelTanks: FuelTankData[] = [];
    let externalVoltage: number | undefined;
    let signalStrength: number | undefined;
    let harshBraking: number | undefined;
    let harshAcceleration: number | undefined;
    let harshCornering: number | undefined;

    // Process each sensor
    sensors.forEach((sensor) => {
      // Process based on sensor type and name
      if (sensor.t === "fuel level") {
        // Extract fuel level data
        const tankName = sensor.n;
        const sensorValue = lastMessage?.p?.[sensor.p.split("/")[0]];

        if (sensorValue !== undefined) {
          // Find the max capacity from the calibration table
          const maxCapacity = getMaxCapacityFromSensor(sensor.d);

          fuelTanks.push({
            tankName,
            currentLevel: sensorValue,
            maxCapacity,
            percentageFull: (sensorValue / maxCapacity) * 100,
            lastUpdated: new Date(lastMessage.t * 1000),
          });
        }
      } else if (sensor.t === "voltage" && sensor.n === "External Voltage") {
        externalVoltage = lastMessage?.p?.[sensor.p.split("/")[0]];
      } else if (sensor.t === "custom" && sensor.n === "Signal Strenght") {
        signalStrength = lastMessage?.p?.[sensor.p];
      } else if (sensor.t === "accelerometer") {
        if (sensor.n === "Harsh Braking Parameters") {
          harshBraking = lastMessage?.p?.[sensor.p];
        } else if (sensor.n === "Harsh Acceleration Parameters") {
          harshAcceleration = lastMessage?.p?.[sensor.p];
        } else if (sensor.n === "Harsh Cornering Parameters") {
          harshCornering = lastMessage?.p?.[sensor.p];
        }
      }
    });

    // Construct and return the vehicle sensor data
    return {
      fleetNumber,
      fullName: avlUnit.general.n,
      lastUpdated: new Date(lastMessage?.t * 1000),
      position: position
        ? {
            latitude: position.y,
            longitude: position.x,
            speed: position.s,
            timestamp: position.t,
          }
        : undefined,
      ignition: lastMessage?.p?.["ignition"] === 1,
      externalVoltage,
      fuelTanks,
      signalStrength,
      drivingBehavior: {
        harshBraking,
        harshAcceleration,
        harshCornering,
      },
    };
  } catch (error) {
    console.error("Error fetching vehicle sensor data:", error);
    throw error;
  }
};

/**
 * Get the total fuel level for a vehicle (sum of all tanks)
 * @param sensorData The vehicle sensor data
 * @returns The total fuel level in liters
 */
export const getTotalFuelLevel = (sensorData: VehicleSensorData): number => {
  return sensorData.fuelTanks.reduce((total, tank) => total + tank.currentLevel, 0);
};

/**
 * Get the total fuel capacity for a vehicle (sum of all tanks)
 * @param sensorData The vehicle sensor data
 * @returns The total fuel capacity in liters
 */
export const getTotalFuelCapacity = (sensorData: VehicleSensorData): number => {
  return sensorData.fuelTanks.reduce((total, tank) => total + tank.maxCapacity, 0);
};

/**
 * Check if sensor data is recent enough to be considered valid
 * @param sensorData The vehicle sensor data
 * @param maxAgeMinutes Maximum age in minutes for data to be considered valid
 * @returns True if the data is recent enough, false otherwise
 */
export const isSensorDataRecent = (
  sensorData: VehicleSensorData,
  maxAgeMinutes: number = 30
): boolean => {
  const now = new Date();
  const dataAge = (now.getTime() - sensorData.lastUpdated.getTime()) / (1000 * 60); // in minutes
  return dataAge <= maxAgeMinutes;
};
