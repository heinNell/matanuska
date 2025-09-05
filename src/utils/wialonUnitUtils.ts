import type { WialonUnit } from '../types/wialon-types';
import type { UnitDetail } from '../types/wialon';

export const createUnitDetail = (wialonUnit: WialonUnit): UnitDetail => {
  const pos = wialonUnit.getPosition?.();
  const unitId = wialonUnit.getId?.() || wialonUnit.id || 0;

  // Explicit extraction to satisfy strict-boolean-expressions (avoid truthiness on possibly any)
  const rawName =
    (typeof wialonUnit.getName === 'function' ? wialonUnit.getName() : undefined) ??
    (typeof (wialonUnit as unknown as { name?: unknown }).name === 'string'
      ? (wialonUnit as unknown as { name?: string }).name
      : undefined);

  const name =
    typeof rawName === 'string' && rawName.trim().length > 0
      ? rawName
      : 'Unknown';

  const rawIcon =
    typeof (wialonUnit as unknown as { iconUrl?: unknown }).iconUrl === 'string'
      ? (wialonUnit as unknown as { iconUrl?: string }).iconUrl
      : undefined;

  const iconUrl = rawIcon ?? '';

  return {
    id: typeof unitId === 'string' ? parseInt(unitId, 10) || 0 : unitId,
    name,
    iconUrl,
    uid: wialonUnit.id,
    position: pos ? { lat: pos.y, lng: pos.x } : null,
    speed: pos?.s ?? 0,
    status: pos ? ((pos.s ?? 0) > 5 ? 'onroad' : 'pause') : 'offline',
    lastMessageTime: pos?.t ?? null,
  };
};

/*#__PURE__*/
export const isValidUnit = (unit: WialonUnit | null): unit is WialonUnit => {
  return unit !== null && typeof unit === 'object';
};
