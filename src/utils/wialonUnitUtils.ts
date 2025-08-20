import type { WialonUnit, UnitDetail } from '../types/wialon-types';

export const createUnitDetail = (wialonUnit: WialonUnit): UnitDetail => {
  const pos = wialonUnit.getPosition?.();
  return {
    id: wialonUnit.getId?.(),
    name: wialonUnit.getName?.(),
    iconUrl: wialonUnit.getIconUrl?.(32) || '',
    uid: wialonUnit.getUniqueId(),
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
