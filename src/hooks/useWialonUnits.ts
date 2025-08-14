import { useCallback, useEffect, useState } from "react";
import type { WialonSession } from "../types/wialon";

// Custom type definitions for Wialon objects
type WialonUnit = {
  id: string | number;
  name: string;
  iconUrl?: string;
  rawObject: any;
  registration: string; // Added to address the 'registration' property error
};

type WialonSensor = {
  id: string | number;
  name: string;
  type: string;
  param: string;
  description: string;
};

type WialonLastMessage = {
  time: number;
  latitude: number;
  longitude: number;
  speed: number;
  params: Record<string, any>;
};

/**
 * A custom hook for fetching Wialon units and their data.
 * It handles the initial load of units, selects a unit, and listens for
 * real-time updates to its last message and sensor data. It also maintains
 * a history of positions for real-time tracking.
 *
 * @param session The Wialon SDK session instance.
 * @param loggedIn A boolean indicating the user's login status.
 * @returns An object containing the units list, selected unit info, last message,
 * a list of sensors, message history for tracking, and functions to select a unit
 * and calculate sensor values.
 */
// Backward compatible signature: first param may be a session or a boolean (loggedIn)
export const useWialonUnits = (
  sessionOrLoggedIn?: WialonSession | boolean,
  loggedInParam: boolean = false
) => {
  // Derive session and loggedIn from flexible params
  const derivedSession: WialonSession | undefined =
    typeof sessionOrLoggedIn === "object"
      ? (sessionOrLoggedIn as WialonSession)
      : (window as any)?.wialon?.core?.Session?.getInstance?.();
  const loggedIn: boolean =
    typeof sessionOrLoggedIn === "boolean" ? sessionOrLoggedIn : loggedInParam;
  const [units, setUnits] = useState<WialonUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<WialonUnit | null>(null);
  const [lastMessage, setLastMessage] = useState<WialonLastMessage | null>(null);
  const [messageHistory, setMessageHistory] = useState<WialonLastMessage[]>([]);
  const [sensors, setSensors] = useState<WialonSensor[]>([]);
  const [loading, setLoading] = useState(false); // Renamed from isLoading to loading
  const [error, setError] = useState<string | null>(null);
  const [eventListenerId, setEventListenerId] = useState<number | null>(null);

  // Effect to load all units initially
  useEffect(() => {
    if (!window.wialon || !window.wialon.item) return;
    if (!derivedSession) return;

    // Load necessary libraries and data flags for units, last message, and sensors.
    const flags =
      window.wialon.item.Item.dataFlag.base |
      (window.wialon.item as any).Unit.dataFlag.lastMessage |
      (window.wialon.item as any).Unit.dataFlag.sensors;

    derivedSession.loadLibrary("itemIcon");
    derivedSession.loadLibrary("unitSensors");

    setLoading(true); // Updated to loading
    setError(null);

    // Use updateDataFlags to load all unit items
    derivedSession.updateDataFlags(
      [{ type: "type", data: "avl_unit", flags: flags, mode: 0 }],
      (code: number) => {
        if (code) {
          setError(`Error loading units: ${window.wialon.core.Errors.getErrorText(code)}`);
          setLoading(false); // Updated to loading
          return;
        }

        const rawUnits = derivedSession.getItems("avl_unit");
        if (rawUnits && rawUnits.length > 0) {
          const formattedUnits = rawUnits.map((u: any) => ({
            id: u.getId(),
            name: u.getName(),
            iconUrl: u.getIconUrl(32),
            rawObject: u,
            registration: u.getProp("custom_field_name") || "", // Placeholder for a custom field
          }));
          setUnits(formattedUnits);
          // Automatically select the first unit
          setSelectedUnit(formattedUnits[0]);
        } else {
          setUnits([]);
          setSelectedUnit(null);
          setSensors([]);
        }
        setLoading(false); // Updated to loading
      }
    );
  }, [derivedSession, loggedIn]);

  // Effect to handle cleanup of the event listener when the component unmounts
  useEffect(() => {
    return () => {
      if (selectedUnit?.rawObject && eventListenerId !== null) {
        selectedUnit.rawObject.removeListenerById(eventListenerId);
      }
    };
  }, [selectedUnit, eventListenerId]);

  // Function to select a new unit and register a listener for real-time updates
  const selectUnit = useCallback(
    (unitId: string | number) => {
      const unitToSelect = units.find((u) => u.id === unitId);
      if (!unitToSelect) {
        setSelectedUnit(null);
        setSensors([]);
        setMessageHistory([]);
        return;
      }

      // Set the new selected unit and its initial state
      setSelectedUnit(unitToSelect);
      const pos = unitToSelect.rawObject.getPosition();

      // Reset message history and add the initial position
      setMessageHistory(
        pos
          ? [
              {
                time: pos.t,
                latitude: pos.y,
                longitude: pos.x,
                speed: pos.s,
                params: pos.p,
              },
            ]
          : []
      );

      if (pos) {
        setLastMessage({
          time: pos.t,
          latitude: pos.y,
          longitude: pos.x,
          speed: pos.s,
          params: pos.p,
        });
      } else {
        setLastMessage(null);
      }

      // Extract sensor data for the new unit
      const rawSensors = unitToSelect.rawObject.getSensors();
      if (rawSensors) {
        const formattedSensors = Object.values(rawSensors).map((s: any) => ({
          id: s.id,
          name: s.n,
          type: s.t,
          param: s.p,
          description: s.d,
        }));
        setSensors(formattedSensors);
      } else {
        setSensors([]);
      }

      // Unbind any previous listener and add a new one for the selected unit
      if (selectedUnit?.rawObject && eventListenerId !== null) {
        selectedUnit.rawObject.removeListenerById(eventListenerId);
      }

      const newListenerId = unitToSelect.rawObject.addListener(
        "messageRegistered",
        (event: any) => {
          const data = event.getData();
          if (data.pos) {
            const newMsg = {
              time: data.pos.t,
              latitude: data.pos.y,
              longitude: data.pos.x,
              speed: data.pos.s,
              params: data.pos.p,
            };
            setLastMessage(newMsg);
            setMessageHistory((prevHistory) => [...prevHistory, newMsg]);
          }
        }
      );
      setEventListenerId(newListenerId);
    },
    [units, selectedUnit, eventListenerId]
  );

  // Function to calculate sensor value based on the last message
  const calculateSensorValue = useCallback(
    (sensor: WialonSensor) => {
      if (!selectedUnit || !lastMessage) {
        return "N/A";
      }
      const result = selectedUnit.rawObject.calculateSensorValue(sensor, {
        pos: { t: lastMessage.time, p: lastMessage.params },
      });
      // The Wialon SDK returns a specific constant for invalid values
      return result === -348201.3876 ? "N/A" : result;
    },
    [selectedUnit, lastMessage]
  );

  return {
    units,
    selectedUnit,
    lastMessage,
    messageHistory,
    sensors,
    loading,
    error,
    selectUnit,
    calculateSensorValue,
  };
};
