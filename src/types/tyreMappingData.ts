import type { TyreStore, StockEntry, StockEntryHistory } from './tyre.js';
import { TyrePosition } from './tyre.js';

// Raw mapping data dump from CSV
export interface TyreMappingRow {
  RegistrationNo: string;
  StoreName: string;
  TyrePosDescription: string;
  TyreCode: string;
}

export const mappingData: TyreMappingRow[] = [
  { RegistrationNo: 'AAX2987', StoreName: '15L', TyrePosDescription: 'V1', TyreCode: 'MAT0171' },
  { RegistrationNo: 'AAX2987', StoreName: '15L', TyrePosDescription: 'V2', TyreCode: 'MAT0172' },
  { RegistrationNo: 'AAX2987', StoreName: '15L', TyrePosDescription: 'V3', TyreCode: 'MAT0173' },
  { RegistrationNo: 'AAX2987', StoreName: '15L', TyrePosDescription: 'V4', TyreCode: 'MAT0174' },
  { RegistrationNo: 'AAX2987', StoreName: '15L', TyrePosDescription: 'SP', TyreCode: 'MAT0175' },

  // 14L
  { RegistrationNo: 'ABA3918', StoreName: '14L', TyrePosDescription: 'V1', TyreCode: 'MAT0471' },
  { RegistrationNo: 'ABA3918', StoreName: '14L', TyrePosDescription: 'V2', TyreCode: 'MAT0472' },
  { RegistrationNo: 'ABA3918', StoreName: '14L', TyrePosDescription: 'V3', TyreCode: 'MAT0473' },
  { RegistrationNo: 'ABA3918', StoreName: '14L', TyrePosDescription: 'V4', TyreCode: 'MAT0474' },
  { RegistrationNo: 'ABA3918', StoreName: '14L', TyrePosDescription: 'SP', TyreCode: 'MAT0125' },

  // 2T (Interlink)
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T1', TyreCode: 'MAT0220' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T2', TyreCode: 'MAT0192' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T3', TyreCode: 'MAT0143' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T4', TyreCode: 'MAT0269' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T5', TyreCode: 'MAT0083' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T6', TyreCode: 'MAT0052' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T7', TyreCode: 'MAT0066' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T8', TyreCode: 'MAT0084' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T9', TyreCode: 'MAT0270' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T10', TyreCode: 'MAT0031' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'SP', TyreCode: 'MAT0108' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T12', TyreCode: 'MAT0230' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T13', TyreCode: 'MAT0029' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T14', TyreCode: 'MAT0228' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T15', TyreCode: 'MAT0232' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T16', TyreCode: 'MAT0056' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T11', TyreCode: 'MAT0217' },

  // 6H (LMV Example)
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V1', TyreCode: 'MAT0306' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V2', TyreCode: 'MAT0307' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V3', TyreCode: 'MAT0180' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V4', TyreCode: 'MAT0181' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V5', TyreCode: 'MAT0179' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V6', TyreCode: 'MAT0178' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'SP', TyreCode: 'MAT0182' },

  // UD
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V1', TyreCode: 'MAT0022' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V2', TyreCode: 'MAT0023' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V3', TyreCode: 'MAT0035' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V4', TyreCode: 'MAT0037' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V5', TyreCode: 'MAT0036' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V6', TyreCode: 'MAT0034' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'SP', TyreCode: 'MAT0038' },

  // --- SPESIALE HORSES EN GROOT VLOTE ---
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V1', TyreCode: 'MAT0281' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V2', TyreCode: 'MAT0282' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V3', TyreCode: 'MAT0283' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V4', TyreCode: 'MAT0284' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V5', TyreCode: 'MAT0285' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V6', TyreCode: 'MAT0286' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V7', TyreCode: 'MAT0287' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V8', TyreCode: 'MAT0288' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V9', TyreCode: 'MAT0289' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V10', TyreCode: 'MAT0280' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'SP', TyreCode: 'MAT0520' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V1', TyreCode: 'MAT0450' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V2', TyreCode: 'MAT0451' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V3', TyreCode: 'MAT0452' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V4', TyreCode: 'MAT0453' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V5', TyreCode: 'MAT0454' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V6', TyreCode: 'MAT0455' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V7', TyreCode: 'MAT0456' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V8', TyreCode: 'MAT0457' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V9', TyreCode: 'MAT0458' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V10', TyreCode: 'MAT0459' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'SP', TyreCode: 'MAT0460' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V1', TyreCode: 'MAT0420' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V2', TyreCode: 'MAT0421' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V3', TyreCode: 'MAT0422' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V4', TyreCode: 'MAT0423' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V5', TyreCode: 'MAT0424' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V6', TyreCode: 'MAT0429' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V7', TyreCode: 'MAT0425' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V8', TyreCode: 'MAT0426' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V9', TyreCode: 'MAT0427' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V10', TyreCode: 'MAT0428' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'SP', TyreCode: 'MAT0519' },

  // 23H, 24H, 26H, 28H
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V1', TyreCode: 'MAT0167' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V2', TyreCode: 'MAT0276' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V3', TyreCode: 'MAT0431' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V4', TyreCode: 'MAT0432' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V5', TyreCode: 'MAT0433' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V6', TyreCode: 'MAT0434' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V7', TyreCode: 'MAT0435' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V8', TyreCode: 'MAT0436' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V9', TyreCode: 'MAT0437' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V10', TyreCode: 'MAT0438' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'SP', TyreCode: 'MAT0496' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V1', TyreCode: 'MAT0274' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V2', TyreCode: 'MAT0236' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V3', TyreCode: 'MAT0406' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V4', TyreCode: 'MAT0407' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V5', TyreCode: 'MAT0408' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V6', TyreCode: 'MAT0409' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V7', TyreCode: 'MAT0410' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V8', TyreCode: 'MAT0411' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V9', TyreCode: 'MAT0412' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V10', TyreCode: 'MAT0413' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'SP', TyreCode: '' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V1', TyreCode: 'MAT0204' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V2', TyreCode: 'MAT0205' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V3', TyreCode: 'MAT0206' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V4', TyreCode: 'MAT0207' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V5', TyreCode: 'MAT0208' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V6', TyreCode: 'MAT0209' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V7', TyreCode: 'MAT0210' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V8', TyreCode: 'MAT0211' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V9', TyreCode: 'MAT0212' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V10', TyreCode: 'MAT0213' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'SP', TyreCode: '' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V1', TyreCode: 'MAT0402' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V2', TyreCode: 'MAT0403' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V3', TyreCode: 'MAT0135' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V4', TyreCode: 'MAT0103' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V5', TyreCode: 'MAT0105' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V6', TyreCode: 'MAT0102' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V7', TyreCode: 'MAT0104' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V8', TyreCode: 'MAT0136' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V9', TyreCode: 'MAT0137' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V10', TyreCode: 'MAT0138' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'SP', TyreCode: '' }
];

// Builds the initial VehicleTyreStore TyreStore object
export function buildVehicleTyreStore(): TyreStore {
  const entries: StockEntry[] = mappingData
    .filter(row => row.TyreCode && row.TyreCode.trim() !== '')
    .map(row => {
      const history: StockEntryHistory[] = [{
        event: 'mounted',
        toStore: 'VehicleTyreStore',
        vehicleReg: row.RegistrationNo,
        position: row.TyrePosDescription as TyrePosition,
        odometer: 0,
        date: new Date().toISOString(),
        user: 'system'
      }];
      return {
        tyreId: row.TyreCode,
        brand: '',
        pattern: '',
        size: '',
  // Default type to a valid TyreType; store name does not represent tyre type
  type: 'drive',
        vehicleReg: row.RegistrationNo,
        position: row.TyrePosDescription as TyrePosition,
        currentTreadDepth: 0,
        lastMountOdometer: 0,
        currentOdometer: 0,
        kmCovered: 0,
        status: 'active',
        history
      };
    });

  return {
    id: 'VehicleTyreStore',
    name: 'Vehicle Tyre Store',
    entries
  };
}
