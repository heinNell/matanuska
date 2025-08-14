// Type augmentation for Wialon SDK
declare namespace W {
  namespace item {
    interface Resource {
      dataFlag: {
        zones: number;
      };
      getZones(): any[];
      getZone(id: number): any;
      getName(): string;
    }
  }
}

// Extend Window interface without conflicting with existing definitions
interface Window {
  // This will be merged with other Window definitions
  wialon: any;
}
