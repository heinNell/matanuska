/**
 * Type definitions for Wialon API objects
 */

export interface WialonPosition {
  lat: number;
  lon: number;
  alt?: number;
  speed?: number;
  course?: number;
  timestamp?: number;
}

export interface WialonSensor {
  id: string;
  name: string;
  type: string;
  value?: any;
  unit?: string;
  description?: string;
}

export interface WialonUnit {
  id: number;
  name: string;
  position?: WialonPosition;
  sensors?: WialonSensor[];
  lastMessage?: Date;

  // Helper methods from Wialon SDK
  getName(): string;
  getId(): number;
  getPosition(): any;
  getLastMessage(): any;
  getSensors?(): any[];

  // Additional properties that might be used in the application
  status?: string;
  [key: string]: any;
}
