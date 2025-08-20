import type { WialonUnit } from '../types/wialon-types';
import type { UnitDetail } from '../types/wialon';

export const createUnitDetail = (wialonUnit: WialonUnit): UnitDetail => {
  const pos = wialonUnit.getPosition?.();
  const unitId = wialonUnit.getId?.() || wialonUnit.id || 0;
  return {
    id: typeof unitId === 'string' ? parseInt(unitId, 10) || 0 : unitId,
    name: wialonUnit.getName?.() || wialonUnit.name || 'Unknown',
    iconUrl: wialonUnit.iconUrl || '',
    uid: wialonUnit.id,
    position: pos ? { lat: pos.y, lng: pos.x } : null,
    speed: pos?.s ?? 0,
    status: pos ? (pos.s ?? 0) > 5 ? 'onroad' : 'pause' : 'offline',
    lastMessageTime: pos?.t ?? null,
  };
};

/*#__PURE__*/
export const isValidUnit = (unit: WialonUnit | null): unit is WialonUnit => {
  return unit !== null && typeof unit === 'object';
};
