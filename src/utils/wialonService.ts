import {
  WialonUnit, WialonResource,
} from "../types/wialon";

/**
 * WialonService class for encapsulating all Wialon SDK logic.
 * This class handles session management, data fetching, and API calls.
 */
class WialonService {
  private session: any;
  private isReady = false;
  private TOKEN: string;

  constructor(token: string) {
    this.TOKEN = token;
    this.session = window.wialon.core.Session.getInstance();
  }

  public async initSession(): Promise<boolean> {
    if (this.isReady) {
      return true;
    }

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.wialon) {
        return reject(new Error("Wialon SDK is not available."));
      }

      this.session.initSession("https://hst-api.wialon.com");

      this.session.loginToken(this.TOKEN, "", (code: number) => {
        if (code !== 0) {
          reject(new Error(window.wialon.core.Errors.getErrorText(code)));
        } else {
          this.isReady = true;
          this.loadLibraries().then(resolve).catch(reject);
        }
      });
    });
  }

  private async loadLibraries(): Promise<boolean> {
    const libraries = [
      "itemIcon", "resourceDrivers", "resourceZones", "unitSensors",
      "unitCommandDefinitions", "resourceReports", "resourceNotifications",
      "unitEventRegistrar",
    ];

    await Promise.all(libraries.map(lib => new Promise(res => {
      this.session.loadLibrary(lib, () => res(true));
    })));
    return true;
  }

  public getUnits(): WialonUnit[] {
    return this.session.getItems('avl_unit') || [];
  }

  public getUnitById(id: number): WialonUnit | null {
    return this.session.getItem(id);
  }

  public async fetchAllData(): Promise<{ units: WialonUnit[], resources: WialonResource[] }> {
    if (!this.isReady) await this.initSession();

    const unitFlags = window.wialon.util.Number.or(
      window.wialon.item.Item.dataFlag.base, window.wialon.item.Unit.dataFlag.lastPosition
    );
    const resFlags = window.wialon.util.Number.or(
      window.wialon.item.Item.dataFlag.base, window.wialon.item.Resource.dataFlag.reports
    );

    return new Promise((resolve, reject) => {
      this.session.updateDataFlags(
        [{ type: "type", data: "avl_unit", flags: unitFlags, mode: 0 },
         { type: "type", data: "avl_resource", flags: resFlags, mode: 0 }],
        (code: number) => {
          if (code !== 0) {
            reject(new Error(window.wialon.core.Errors.getErrorText(code)));
          } else {
            const units = this.session.getItems('avl_unit') || [];
            const resources = this.session.getItems('avl_resource') || [];
            resolve({ units, resources });
          }
        }
      );
    });
  }

  public getSessionId(): string {
    return this.session.getId();
  }

  public addPositionListener(unit: WialonUnit, callback: (pos: any) => void): number {
    return unit.addListener('changePosition', (event: any) => callback(event.getData()));
  }

  public removePositionListener(unit: WialonUnit, listenerId: number): void {
    unit.removeListenerById(listenerId);
  }

  public async executeReport(resourceId: number, template: any, unitId: number, interval: any): Promise<any> {
    const resource = this.session.getItem(resourceId);
    if (!resource) {
      throw new Error("Resource not found");
    }
    return new Promise((resolve, reject) => {
      resource.execReport(template, unitId, 0, interval, (code: number, result: any) => {
        if (code !== 0) {
          reject(new Error(window.wialon.core.Errors.getErrorText(code)));
        } else {
          resolve(result);
        }
      });
    });
  }

  public async getGeofences(resourceId: number): Promise<any> {
    const resource = this.session.getItem(resourceId);
    if (!resource) {
      throw new Error("Resource not found");
    }
    return resource.getZones();
  }

  /**
   * Fetches the value of a sensor from a unit.
   * Returns latest value, or "N/A" if unavailable.
   */
  public async getSensorValue(unitId: number, sensorId: number): Promise<number | string | null> {
    await this.initSession();
    const unit = this.session.getItem(unitId);
    if (!unit) return null;
    const sensors = unit.getSensors?.() || [];
    const sensor = sensors.find((s: any) => String(s.id) === String(sensorId));
    if (!sensor) return null;

    // Get latest message (AVL data)
    const msg = unit.getLastMessage?.();
    if (!msg || !msg.p) return "N/A";
    // Find value by sensor's parameter (assuming "p" property as sensor key)
    const val = msg.p[sensor.p];
    return typeof val !== "undefined" ? val : "N/A";
  }

  /**
   * Subscribes to live updates of a sensor value for a unit.
   * Returns an unsubscribe function.
   */
  public subscribeToSensor(
    unitId: number,
    sensorId: number,
    callback: (val: number | string) => void
  ): () => void {
    let prevVal: number | string | null = null;
    const unit = this.session.getItem(unitId);
    if (!unit) return () => {};

    const handler = () => {
      const sensors = unit.getSensors?.() || [];
      const sensor = sensors.find((s: any) => String(s.id) === String(sensorId));
      if (!sensor) return;
      const msg = unit.getLastMessage?.();
      if (!msg || !msg.p) return;
      const val = msg.p[sensor.p];
      if (val !== prevVal) {
        prevVal = val;
        callback(typeof val !== "undefined" ? val : "N/A");
      }
    };

    // Listen for changePosition (new AVL messages)
    const listenerId = unit.addListener("changePosition", handler);

    // Initial call
    handler();

    // Return unsubscribe function
    return () => unit.removeListener("changePosition", listenerId);
  }

  /**
   * Update fuel consumption parameters for a unit
   * @param unitId - The ID of the unit to update
   * @param idling - Fuel consumption when idling (L/h)
   * @param urban - Fuel consumption in urban conditions (L/100km)
   * @param suburban - Fuel consumption in suburban conditions (L/100km)
   */
  public async updateFuelMathParams(
    unitId: number,
    idling: number,
    urban: number,
    suburban: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        return reject(new Error("Wialon session is not initialized"));
      }

      // Get the unit
      const unit = this.session.getItem(unitId);
      if (!unit) {
        return reject(new Error(`Unit with ID ${unitId} not found`));
      }

      // Prepare fuel math parameters
      const fuelMathParams = {
        idling_consumption: idling,
        urban_consumption: urban,
        suburban_consumption: suburban
      };

      // Update unit parameters using Wialon API
      unit.updateItemObject(
        "mu",
        { fuel_math_params: fuelMathParams },
        (code: number) => {
          if (code !== 0) {
            reject(new Error(window.wialon.core.Errors.getErrorText(code)));
          } else {
            resolve();
          }
        }
      );
    });
  }
}

// You can use env var or config for token
export const wialonService = new WialonService("5dce19710a5e26ab8b7b8986cb3c49e58C291791B7F0A7AEB8AFBFCEED7DC03BC48FF5F8");
