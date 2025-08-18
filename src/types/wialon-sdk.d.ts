// src/types/wialon-sdk.d.ts

// ==== Main W namespace ====
declare namespace W {
  const version: string;
  let debug: boolean;

  // ====== Utility Functions ======
  namespace Util {
    interface Time {
      dstFlags: Record<string, number>;
      dstRules: Record<string, number>;
      getTimeZoneOffset(): number;
      isLeapYear(year: number): boolean;
      getWdayTime(
        year: number,
        month: number,
        weeks: number,
        weekDay: number,
        monthDay?: number,
        hours?: number,
        minutes?: number,
        seconds?: number
      ): number;
      getMonthDays(month: number, year: number): number;
      getYearDays(year: number): number;
    }

    const time: Time;
    namespace DateTime {
      function formatTime(timestamp: number, format?: string): string;
    }
  }

  // ====== Event System ======
  interface Evented {
    on(types: string | Record<string, Function>, fn?: Function, context?: any): this;
    off(types?: string | Record<string, Function>, fn?: Function, context?: any): this;
    fire(type: string, data?: any, propagate?: boolean): this;
    listens(type: string, propagate?: boolean): boolean;
    once(types: string | Record<string, Function>, fn?: Function, context?: any): this;
    addEventParent(obj: any): this;
    removeEventParent(obj: any): this;
  }

  // ====== Core Session ======
  namespace core {
    interface SessionStatic {
      getInstance(): Session;
    }
    interface ErrorsStatic {
      getErrorText(code: number): string;
    }
    const Session: SessionStatic;
    const Errors: ErrorsStatic;
  }

  interface Session extends Evented {
    initSession(url: string): void;
    loginToken(token: string, params: string, callback: (code: number) => void): void;
    loadLibrary(name: string): void;
    updateDataFlags(
      flags: Array<{ type: string; data: string; flags: number; mode: number }>,
      callback: (code: number) => void
    ): void;
    getItems(type?: string): any[];
    getItem(id: number): any;
    logout(): void;
    // Commonly used convenience methods (not always present in older SDK docs)
    getCurrUser?(): { getName?: () => string } | null;
    getServerTime?(): number;
    getTokenExpiration?(): number;
  }

  // ====== Item Namespace ======
  namespace item {
    interface Item {
      dataFlag: {
        base: number;
      };
    }

    interface Unit extends Item, Evented {
      dataFlag: {
        base: number;
        sensors: number;
        lastMessage: number;
        lastPosition: number;
      };
      getId(): number;
      getName(): string;
      getIconUrl(size: number): string;
      getPosition(): WialonPosition | null;
      getLastMessage(): any | null;
      getSensors(): { [key: string]: WialonSensor } | undefined;
      getSensor(sensorId: number): WialonSensor | undefined;
      calculateSensorValue(sensor: WialonSensor, message: any): number | undefined;
      getUniqueId(): string;
      getCustomProperty(propName: string): string | undefined;
      addListener(event: string, callback: (event: any) => void): number;
      removeListenerById(eventId: number): void;
    }

    const Item: Item;
    const Unit: Unit;
  }

  // ====== Class System ======
  interface Class {
    extend(properties: any): any;
    include(properties: any): this;
    mergeOptions(options: any): this;
  }

  // ====== Request Class ======
  interface Request {
    new (url: string, path?: string, options?: any, counter?: number): Request;
    api(method: string, params: any, callback: (data: any) => void): void;
    send(
      path: string,
      params: any,
      successCallback: (data: any) => void,
      errorCallback?: (data: any) => void
    ): void;
    destroy(): void;
  }

  const Class: Class;
  const Evented: Class;
  const Session: Class;
  const Request: Request;
  const Mixin: { Events: any };
}

// ====== Support Interfaces ======
interface WialonPosition {
  x: number; // longitude
  y: number; // latitude
  s: number; // speed
  c: number; // course
  t: number; // timestamp
  sc: number; // satellites
}

interface WialonSensor {
  id: number;
  n: string;
  t: string;
  m: number;
}

type WialonUnit = W.item.Unit;

// ====== Global Window binding ======
interface Window {
  wialon: typeof W;
  W: typeof W;
}

// MReport interfaces
interface WialonMReport {
  intervalFlag: {
    absolute: number;
  };
}

interface WialonItem {
  MReport: WialonMReport;
}

interface WialonSDK {
  core: {
    Errors: {
      getErrorText(code: number): string;
    };
  };
  item: WialonItem;
}

declare global {
  interface Window {
    wialon: WialonSDK;
  }
}

export {};
