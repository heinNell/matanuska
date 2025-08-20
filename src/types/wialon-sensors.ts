// src/types/wialon-types.ts
import type { Position } from "./wialon-position";

/**
 * Shared UnitDetail shape for the app.
 * Keep this in one place so all hooks/components/sensor code can import it.
 */
export interface UnitDetail {
  id: number | string;
  name: string;
  iconUrl?: string | null;
  position?: Position | null;
  properties?: Record<string, any> | null;
  raw?: Record<string, any> | null;
}
