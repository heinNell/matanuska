// Tyre Size & Pattern Reference Data

// Fleet-specific tyre position references
export interface FleetPositionReference {
  fleetNo: string;
  vehicleType: 'HORSE' | 'INTERLINK' | 'REEFER' | 'LMV' | 'OTHER';
  positions: string[];
}

export const FLEET_POSITIONS: FleetPositionReference[] = [
  // HORSES (Truck Tractors, 11 positions each)
  { fleetNo: '14L', vehicleType: 'HORSE', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7', 'POS 8', 'POS 9', 'POS 10', 'POS 11'] },
  { fleetNo: '15L', vehicleType: 'HORSE', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7', 'POS 8', 'POS 9', 'POS 10', 'POS 11'] },
  { fleetNo: '21H', vehicleType: 'HORSE', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7', 'POS 8', 'POS 9', 'POS 10', 'POS 11'] },
  { fleetNo: '22H', vehicleType: 'HORSE', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7', 'POS 8', 'POS 9', 'POS 10', 'POS 11'] },
  { fleetNo: '23H', vehicleType: 'HORSE', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7', 'POS 8', 'POS 9', 'POS 10', 'POS 11'] },
  { fleetNo: '24H', vehicleType: 'HORSE', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7', 'POS 8', 'POS 9', 'POS 10', 'POS 11'] },
  { fleetNo: '26H', vehicleType: 'HORSE', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7', 'POS 8', 'POS 9', 'POS 10', 'POS 11'] },
  { fleetNo: '28H', vehicleType: 'HORSE', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7', 'POS 8', 'POS 9', 'POS 10', 'POS 11'] },
  { fleetNo: '31H', vehicleType: 'HORSE', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7', 'POS 8', 'POS 9', 'POS 10', 'POS 11'] },
  { fleetNo: '32H', vehicleType: 'HORSE', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7', 'POS 8', 'POS 9', 'POS 10', 'POS 11'] },

  // INTERLINKS (18 positions each: 16 tyres + 2 spares)
  { fleetNo: '1T', vehicleType: 'INTERLINK', positions: Array.from({ length: 16 }, (_, i) => `POS ${i + 1}`).concat(['POS 17 (SPARE 1)', 'POS 18 (SPARE 2)']) },
  { fleetNo: '2T', vehicleType: 'INTERLINK', positions: Array.from({ length: 16 }, (_, i) => `POS ${i + 1}`).concat(['POS 17 (SPARE 1)', 'POS 18 (SPARE 2)']) },
  { fleetNo: '3T', vehicleType: 'INTERLINK', positions: Array.from({ length: 16 }, (_, i) => `POS ${i + 1}`).concat(['POS 17 (SPARE 1)', 'POS 18 (SPARE 2)']) },
  { fleetNo: '4T', vehicleType: 'INTERLINK', positions: Array.from({ length: 16 }, (_, i) => `POS ${i + 1}`).concat(['POS 17 (SPARE 1)', 'POS 18 (SPARE 2)']) },

  // REEFERS (8 positions each: 6 tyres + 2 spares)
  { fleetNo: '4F', vehicleType: 'REEFER', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7 (SPARE 1)', 'POS 8 (SPARE 2)'] },
  { fleetNo: '5F', vehicleType: 'REEFER', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7 (SPARE 1)', 'POS 8 (SPARE 2)'] },
  { fleetNo: '6F', vehicleType: 'REEFER', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7 (SPARE 1)', 'POS 8 (SPARE 2)'] },
  { fleetNo: '7F', vehicleType: 'REEFER', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7 (SPARE 1)', 'POS 8 (SPARE 2)'] },
  { fleetNo: '8F', vehicleType: 'REEFER', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7 (SPARE 1)', 'POS 8 (SPARE 2)'] },

  // LMVs ONLY (7 positions: 6 tyres + 1 spare)
  { fleetNo: '4H', vehicleType: 'LMV', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7 (SPARE)'] },
  { fleetNo: '6H', vehicleType: 'LMV', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7 (SPARE)'] },
  { fleetNo: 'UD', vehicleType: 'LMV', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7 (SPARE)'] },
  { fleetNo: '30H', vehicleType: 'LMV', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7 (SPARE)'] },

  // 11-POSITION VEHICLE
  { fleetNo: '29H', vehicleType: 'OTHER', positions: ['POS 1', 'POS 2', 'POS 3', 'POS 4', 'POS 5', 'POS 6', 'POS 7', 'POS 8', 'POS 9', 'POS 10', 'POS 11 (SPARE)'] },
];

// Tyre store/location enum
export enum TyreStoreLocation {
  VICHELS_STORE = 'Vichels Store',
  HOLDING_BAY = 'Holding Bay',
  RFR = 'RFR',
  SCRAPPED = 'Scrapped'
}

// Helper functions for fleet positions
export const getPositionsByFleet = (fleetNo: string): string[] => {
  const fleet = FLEET_POSITIONS.find(fleet => fleet.fleetNo === fleetNo);
  return fleet ? fleet.positions : [];
};

export const getFleetsByVehicleType = (vehicleType: string): FleetPositionReference[] => {
  return FLEET_POSITIONS.filter(fleet => fleet.vehicleType === vehicleType);
};

export const getAllFleetNumbers = (): string[] => {
  return FLEET_POSITIONS.map(fleet => fleet.fleetNo);
};

export interface TyreReference {
  brand: string;
  pattern: string;
  size: string;
  position: 'Drive' | 'Multi' | 'Steer' | 'Trailer';
}

export const TYRE_REFERENCES: TyreReference[] = [
  // 315/80R22.5 (Drive)
  { brand: 'Firemax', pattern: '', size: '315/80R22.5', position: 'Drive' },
  { brand: 'TRIANGLE', pattern: 'TR688', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Terraking', pattern: 'HS102', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Compasal', pattern: 'TR688', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Windforce', pattern: 'WD2020', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Windforce', pattern: 'WD2060', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Compasal', pattern: 'CPD82', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Perelli', pattern: 'FG01S', size: '315/80R22.5', position: 'Drive' },
  { brand: 'POWERTRAC', pattern: 'TractionPro', size: '315/80R22.5', position: 'Drive' },
  { brand: 'SUNFULL', pattern: 'HF638', size: '315/80R22.5', position: 'Drive' },
  { brand: 'SUNFULL', pattern: 'HF768', size: '315/80R22.5', position: 'Drive' },
  { brand: 'FORMULA', pattern: '', size: '315/80R22.16', position: 'Drive' },
  { brand: 'PIRELLI', pattern: '', size: '315/80R22.17', position: 'Drive' },
  { brand: 'Wellplus', pattern: 'WDM16', size: '315/80R22.5', position: 'Drive' },

  // 315/80R22.5 (Dual / Multi)
  { brand: 'Dunlop', pattern: 'SP571', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Firemax', pattern: 'FM188', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Firemax', pattern: 'FM19', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Terraking', pattern: 'HS268', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Windforce', pattern: 'WA1060', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Dunlop', pattern: 'SP320A', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Sonix', pattern: '', size: '315/80R22.5', position: 'Multi' },
  { brand: 'FORMULA', pattern: '', size: '315/80R22.29', position: 'Multi' },
  { brand: 'PIRELLI', pattern: '', size: '315/80R22.5', position: 'Multi' },

  // 315/80R22.5 (Steer)
  { brand: 'Traiangle', pattern: 'TRS03', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Sunfull', pattern: 'HF660', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Compasal', pattern: 'CPS60', size: '315/80R22.5', position: 'Steer' },
  { brand: 'SONIX', pattern: 'SX668', size: '315/80R22.5', position: 'Steer' },
  { brand: 'FORMULA', pattern: '', size: '315/80R22.5', position: 'Steer' },
  { brand: 'PIRELLI', pattern: '', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Firemax', pattern: 'FM66', size: '315/80R22.5', position: 'Steer' },
  { brand: 'WellPlus', pattern: 'WDM916', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Firemax', pattern: 'FM166', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Windforce', pattern: 'WH1020', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Firemax', pattern: 'FM18', size: '315/80R22.5', position: 'Steer' },

  // 315/80R22.5 (Trailer)
  { brand: 'POWERTRAC', pattern: 'Tracpro', size: '315/80R22.5', position: 'Trailer' },
  { brand: 'Sunfull', pattern: 'HF660', size: '315/80R22.5', position: 'Trailer' },
  { brand: 'SUNFULL', pattern: 'ST011', size: '315/80R22.5', position: 'Trailer' },

  // 385/65R22.5 (Steer)
  { brand: 'Firemax', pattern: 'FM06', size: '385/65R22.5', position: 'Steer' },
  { brand: 'TECHSHIELD', pattern: 'TS778', size: '385/65R22.5', position: 'Steer' },
];

// Helper functions to get unique values for dropdown options
export const getUniqueTyreSizes = (): string[] => {
  const sizes = new Set(TYRE_REFERENCES.map(tyre => tyre.size));
  return Array.from(sizes).sort();
};

export const getUniqueTyreBrands = (): string[] => {
  const brands = new Set(TYRE_REFERENCES.map(tyre => tyre.brand));
  return Array.from(brands).sort();
};

export const getUniqueTyrePatterns = (): string[] => {
  const patterns = new Set(TYRE_REFERENCES.map(tyre => tyre.pattern).filter(pattern => pattern !== ''));
  return Array.from(patterns).sort();
};

export const getTyresByPosition = (position: string): TyreReference[] => {
  return TYRE_REFERENCES.filter(tyre => tyre.position === position);
};

export const getTyresBySize = (size: string): TyreReference[] => {
  return TYRE_REFERENCES.filter(tyre => tyre.size === size);
};

export const getTyresByBrand = (brand: string): TyreReference[] => {
  return TYRE_REFERENCES.filter(tyre => tyre.brand === brand);
};

// Vendor reference data
export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  mobile?: string;
  address?: string;
  city?: string;
}

export const VENDORS: Vendor[] = [
  { id: "FTS001", name: "Field Tyre Services", contactPerson: "Joharita", email: "admin@fieldtyreservices.co.za", address: "13 Varty Street Duncanville Vereeniging 1930", city: "Vereeniging" },
  { id: "ACB001", name: "Art Cooperation Battery express", city: "Mutare" },
  { id: "CPT001", name: "City Path Trading", city: "Harare" },
  { id: "SPI001", name: "Spetmic Investments (Pvt) Ltd t/a City Path Trading", city: "Harare" },
  { id: "SPE001", name: "Spare Parts Exchange (Pvt) Ltd", address: "5a Martin Drive, Msasa, Harare", city: "Harare" },
  { id: "HM001", name: "Hinge Master SA", address: "18 Buwbes Road - Sebenza. Edenvale", city: "Johannesburg" },
  { id: "ITS001", name: "Impala Truck Spares (PTA) CC", contactPerson: "Andre", address: "1311 Van Der Hoff Road, Zandfontein, Pretoria, 0082 Gauteng", city: "Pretoria" },
  { id: "MON001", name: "Monfiq Trading (Pvt) Ltd t/a Online Motor Spares", city: "Mutare" },
  { id: "AJF001", name: "A&J Field Services", contactPerson: "JJ" },
  { id: "ELL001", name: "ELlemand", address: "Polokwane", city: "Polokwane South Africa" },
  { id: "ESP001", name: "Eurosanparts", contactPerson: "Daniel van Zyl", mobile: "0795140948", address: "Robbertville Roodepoort", city: "Johannesburg,South Africa" },
  { id: "ECR001", name: "EASY COOL REFRIGERATION", contactPerson: "Jacob", email: "jacob@tashrefrigeration.co.za", mobile: "0766520310", address: "9 Bogenia st,Pomona, Kemptonpark, Kemptonpark jhb 1619", city: "Johannesburg" },
  { id: "HTE001", name: "Horse Tech Engineering", email: "cain@matanuska.co.zw", address: "28 B Chimoiio Ave", city: "Mutare" },
  { id: "VO001", name: "Victor Onions", email: "cain@matanuska.co.zw", address: "18 Edison Crescent Graniteside Harare, Zimbabwe", city: "Harare" },
  { id: "INV001", name: "Indale investments", email: "cain@matanuska.co.zw", mobile: "263242486200", address: "BAY 2, 40 MARTIN DRIVE, HARARE", city: "Harare" },
  { id: "BC001", name: "Brake and Clutch", email: "cain@matanuska.co.zw", city: "Mutare" },
  { id: "MAT001", name: "Matanuska", contactPerson: "Cain Jeche", email: "cain@matanuska.co.zw", city: "Mutare" },
  { id: "DC001", name: "Drum City Pvt Ltd", email: "cain@matanuska.co.zw", mobile: "669905.669889", address: "859 Bignell Rd, New Ardbennie", city: "Harare" },
  { id: "BSI001", name: "BSI Motor Spares", email: "cain@matanuska.co.zw", address: "21 Jameson Street", city: "Mutare" },
  { id: "ACE001", name: "Ace Hardware Zimbabwe (Pvt) Ltd t/a Ace Industrial Hardware", email: "cain@matanuska.co.zw", address: "35 Coventry Rd, Harare, Zimbabwe", city: "Harare" },
  { id: "SL001", name: "Scanlink", email: "cain@matanuska.co.zw", city: "Harare" },
  { id: "WE001", name: "Wardstore Enterprises t/a Taita Trading", email: "cain@matanuska.co.zw", city: "Harare" },
  { id: "DI001", name: "Dorems Investments", email: "cain@matanuska.co.zw", city: "Mutare" },
  { id: "BI001", name: "Bessell Investments", contactPerson: "Laminanes", email: "cain@matanuska.co.zw", mobile: "0712752122", address: "31 Tembwe Street", city: "Mutare" },
  { id: "BOC001", name: "BPC Gas", email: "cain@matanuska.co.zw", city: "Mutare" },
  { id: "ET001", name: "ELVITATE TRADING ( PVT) LTD", contactPerson: "Elvis", email: "cain@matanuska.co.zw", mobile: "263774330394", address: "14 Riverside Mutare", city: "Mutare" },
  { id: "BRI001", name: "BRAFORD INVESTMENTS (PVT) LTD", email: "accounts@braford.co.zw, sales@braford.co.zw", address: "2 SILVERTON AVENUE GREENDALE HARARE", city: "Harare" },
  { id: "RI001", name: "Rodirsty International", contactPerson: "VAT22027338", email: "sales@rodirsty.com", mobile: "0772900347", address: "29 MAZOE TRAVEL PLAZA", city: "Harare" },
  { id: "VAL001", name: "Valtech", email: "cain@matanuska.co.zw", city: "Mutare" },
  { id: "ZUV001", name: "Zuva", city: "Harare" },
  { id: "FSF001", name: "Five Star", city: "Mutare" },
  { id: "SF001", name: "Super Fuels", city: "Mutare" },
  { id: "SM001", name: "Steelmakers Zimbabwe (Pvt) Ltd", email: "cain@matanuska.co.zw", city: "Mutare" },
  { id: "EZY001", name: "Ezytrack (Pvt) Ltd", city: "Harare" },
  { id: "WET001", name: "Wardstore Enterprises t/a Taita Trading", city: "Harare" },
  { id: "RLA001", name: "Rite-Line Alignment (pvt) Ltd", city: "Harare" },
  { id: "RIC001", name: "RIC Hyraulic And Engineering P/L", city: "Harare" },
  { id: "PT001", name: "Associated Tyres (Pvt) Ltd t/a Protyre Mutare", city: "Mutare" },
  { id: "NA001", name: "Nichpau Automotive t/a Spares Centre", city: "Harare" },
  { id: "TI001", name: "Tentrack Investments (Pvt) Ltd", city: "Mutare" },
  { id: "ME001", name: "Mountskills Enterprises", email: "cain@matanuska.co.zw", mobile: "0772731426,071863660", address: "6 Vumba Road Eastern District Engineering Complex", city: "Mutare" },
  { id: "MI001", name: "Mallworth Investments (Pvt) Ltd", city: "Harare" },
  { id: "BSI002", name: "Bering Strait Investments (Pvt) Ltd t/a B.S.I Motor Parts", city: "Mutare" },
  { id: "AI001", name: "Axle Investments Pvt Ltd t/a Matebeleland Trucks", city: "Harare" }
];

// Helper functions for vendor data
export const getVendorsByCity = (city: string): Vendor[] => {
  return VENDORS.filter(vendor => vendor.city === city);
};

export const getVendorById = (id: string): Vendor | undefined => {
  return VENDORS.find(vendor => vendor.id === id);
};

export const getVendorsByName = (name: string): Vendor[] => {
  return VENDORS.filter(vendor => vendor.name.toLowerCase().includes(name.toLowerCase()));
};

// Add function to filter inventory by criteria
export const getInventoryItemsByCriteria = (
  brand?: string,
  size?: string,
  pattern?: string,
  storeLocation?: TyreStoreLocation
): TyreInventoryItem[] => {
  return MOCK_INVENTORY.filter(item => {
    if (brand && item.tyreRef.brand !== brand) return false;
    if (size && item.tyreRef.size !== size) return false;
    if (pattern && item.tyreRef.pattern !== pattern) return false;
    if (storeLocation && item.storeLocation !== storeLocation) return false;
    return true;
  });
};
// Mock inventory data based on the reference lists
export interface TyreInventoryItem {
  id: string;
  tyreRef: TyreReference;
  serialNumber: string;
  dotCode: string;
  purchaseDate: string;
  cost: number;
  supplier: Vendor;
  status: 'in_stock' | 'installed' | 'scrapped';
  storeLocation: TyreStoreLocation;
  notes?: string;
  // Extended properties to simplify access in components
  quantity: number;
  reorderLevel: number;
  // Direct properties for nested data
  brand: string;
  pattern: string;
  size: string;
  position: string;
  supplierId: string;
}

// Generate some mock inventory data
export const generateMockInventory = (): TyreInventoryItem[] => {
  const inventory: TyreInventoryItem[] = [];
  const storeLocationOptions = Object.values(TyreStoreLocation);
  const randomStoreIndex = Math.floor(Math.random() * storeLocationOptions.length);
  // Create a few inventory items for each position type
  ['Drive', 'Steer', 'Trailer', 'Multi'].forEach((position, posIndex) => {
    const tyres = getTyresByPosition(position);

    tyres.slice(0, 3).forEach((tyre, index) => {
      const vendorIndex = Math.floor(Math.random() * VENDORS.length);
      const quantity = Math.floor(Math.random() * 10);
      const reorderLevel = Math.floor(Math.random() * 3) + 1;

      inventory.push({
        id: `INV-${position.charAt(0)}${posIndex}${index}`,
        tyreRef: tyre,
        serialNumber: `SN${Math.floor(Math.random() * 10000000)}`,
        dotCode: `DOT${Math.floor(Math.random() * 1000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 1000)}`,
        purchaseDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        cost: Math.floor(Math.random() * 1000) + 500,
        supplier: VENDORS[vendorIndex],
        status: Math.random() > 0.3 ? 'in_stock' : (Math.random() > 0.5 ? 'installed' : 'scrapped'),
        storeLocation: storeLocationOptions[randomStoreIndex],
        quantity,
        reorderLevel,
        brand: tyre.brand,
        pattern: tyre.pattern,
        size: tyre.size,
        position: tyre.position,
        supplierId: VENDORS[vendorIndex].id
      });
    });
  });

  return inventory;
};

export const MOCK_INVENTORY = generateMockInventory();

// Exported tyreSizes and tyreBrands for use in TyreDashboard
export const tyreSizes = getUniqueTyreSizes();
export const tyreBrands = getUniqueTyreBrands();