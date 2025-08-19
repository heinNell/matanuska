import { FC, useEffect, useRef } from 'react';
import { wialonService } from '../services/wialonService';
import { WialonUnit } from '../types/wialon'; // FIX: Removed UnitDetail as it is not needed here

interface RealtimeUnitTrackerProps {
  unitId: number | null;
  map: L.Map | null;
}

const RealtimeUnitTracker: FC<RealtimeUnitTrackerProps> = ({ unitId, map }) => {
  const listenerIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!unitId || !map) return;

    // FIX: The type is correctly WialonUnit now
    const unit: WialonUnit | null = wialonService.getUnitById(unitId);
    if (!unit) {
      console.error(`Unit with ID ${unitId} not found.`);
      return;
    }

    const onPositionChange = (pos: any) => {
      // FIX: The map.panTo() method expects a LatLngExpression, which a simple array [lat, lng] is.
      // The original code was fine, but we'll ensure type safety in the service call.
      const newLatLng = [pos.y, pos.x];
      map.panTo(newLatLng as L.LatLngExpression, { animate: true, duration: 0.5 });
    };

    // FIX: addPositionListener now takes a number (unitId), which is a better abstraction.
    listenerIdRef.current = wialonService.addPositionListener(unit.getId(), onPositionChange);

    // Cleanup function
    return () => {
      if (listenerIdRef.current) {
        // FIX: The removePositionListener also now takes unitId and listenerId.
        wialonService.removePositionListener(unit.getId(), listenerIdRef.current);
      }
    };
  }, [unitId, map]);

  return null;
};

export default RealtimeUnitTracker;
