import {
  WialonUnit, WialonResource,
} from "../types/wialon";

/**
 * WialonService class for encapsulating all Wialon SDK logic.
 * This class handles session management, data fetching, and API calls.
 */
class WialonService {
  private session: any;
  private isReady: boolean = false;
  private TOKEN: string;

  constructor(token: string) {
    this.TOKEN = token;
    if (typeof window !== 'undefined' && window.wialon) {
      this.session = window.wialon.core.Session.getInstance();
    }
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
    // FIX: This returns the raw Wialon SDK object, which has methods like addListener.
    // The previous error was caused by trying to call these methods on a plain data object.
    return this.session.getItem(id);
  }

  public async fetchAllData(): Promise<{ units: WialonUnit[], resources: WialonResource[] }> {
    if (!this.isReady) await this.initSession();

    const unitFlags = (window.wialon.util as any).Number.or(
      (window.wialon.item as any).Item.dataFlag.base, (window.wialon.item as any).Unit.dataFlag.lastPosition
    );
    const resFlags = (window.wialon.util as any).Number.or(
      (window.wialon.item as any).Item.dataFlag.base, (window.wialon.item as any).Resource.dataFlag.reports
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

  public addPositionListener(unitId: number, callback: (pos: any) => void): number | null {
    const unit = this.getUnitById(unitId);
    if (!unit) {
      console.error(`Unit with ID ${unitId} not found.`);
      return null;
    }
    // FIX: The addListener method exists on the raw Wialon SDK object, not our data model.
    return (unit as any).addListener('changePosition', (event: any) => callback(event.getData()));
  }

  public removePositionListener(unitId: number, listenerId: number): void {
    const unit = this.getUnitById(unitId);
    if (unit) {
      // FIX: Call removeListenerById on the raw Wialon SDK object.
      (unit as any).removeListenerById(listenerId);
    }
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
}

export const wialonService = new WialonService("c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053");
