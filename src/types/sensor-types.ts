/** ──────────────────────────────────────────────────────────────
 *  Domain models
 *  ──────────────────────────────────────────────────────────────*/
export interface ISensor {
  id:    string;
  name:  string;
  value: number;
  unit:  string;
  status?: "active" | "inactive" | "error";
}

export interface ISensorValues {
  sensors: ISensor[];
  lastUpdated?: string;          // ISO timestamp
}
